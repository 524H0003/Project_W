import {
	Body,
	Controller,
	forwardRef,
	Get,
	Inject,
	Param,
	Post,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserRecieve } from 'user/user.entity';
import { AvatarFileUpload, BaseController } from './utils/controller.utils';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from './interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { UserAuthencation, UserLogIn, UserSignUp } from 'user/user.dto';
import { Throttle } from '@nestjs/throttler';
import { BaseUserEmail } from './app.dto';
import { Hook } from './hook/hook.entity';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { join } from 'path';
import {
	GetMetaData,
	GetRequest,
	HookGuard,
	IRefreshResult,
	LocalhostGuard,
	MetaData,
	RefreshGuard,
} from 'auth/guards';
import { FastifyReply } from 'fastify';

/**
 * Application Controller
 */
@Controller({ version: '1', path: '' })
@UseInterceptors(CacheInterceptor)
export class AppController extends BaseController {
	/**
	 * Initiate controller
	 * @param {AppService} svc - general app service
	 * @param {ConfigService} cfg - general app config
	 */
	constructor(
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
		protected cfg: ConfigService,
	) {
		super(svc, cfg);
	}

	/**
	 * Login request
	 */
	@Post('login') @UseInterceptors(FileInterceptor()) async login(
		@Body() body: UserLogIn,
		@GetMetaData() mtdt: MetaData,
		@GetRequest('hostname') hostname: string,
	): Promise<UserRecieve> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			const { message } = error as ServerException;
			switch (true) {
				case message.includes(err('Invalid', 'User', 'SignUp')):
					return this.svc.bloc.getTokens(
						(await this.svc.auth.login(body)).id,
						mtdt,
					);

				case message.includes(err('Success', 'User', 'SignUp')):
					return this.resetPasswordViaEmail(hostname, body, mtdt);

				default:
					throw error;
			}
		}
	}

	/**
	 * Sign up request
	 */
	@Post('sign-up')
	@UseGuards(LocalhostGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Body() body: UserSignUp,
		@GetMetaData() mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<UserRecieve> {
		const result = await this.svc.auth.signUp(body, avatar || null);
		return this.svc.bloc.getTokens(result.id, mtdt);
	}

	/**
	 * Logout request
	 */
	@Post('logout') @UseGuards(RefreshGuard) async logout(
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<UserRecieve> {
		const { rootId } = refresh;

		await this.svc.bloc.removeTree(rootId);

		return new UserRecieve({
			response: { message: err('Success', 'User', 'LogOut') },
		});
	}

	/**
	 * Refreshing tokens request
	 */
	@Post('refresh') @UseGuards(RefreshGuard) async refresh(
		@GetMetaData() mtdt: MetaData,
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<UserRecieve> {
		const { metaData, rootId, blocHash, blocId } = refresh;

		if (metaData !== JSON.stringify(sortObjectKeys(mtdt))) {
			await this.svc.bloc.removeTree(rootId);
			return new UserRecieve({
				response: { message: err('Invalid', 'Signature', '') },
			});
		}

		return new UserRecieve({ accessToken: blocId, refreshToken: blocHash });
	}

	/**
	 * Change password via console
	 */
	@Throttle({ requestSignature: { limit: 1, ttl: 600000 } })
	@Post('request-signature')
	protected async requestSignatureViaConsole(
		@Body() { email }: BaseUserEmail,
		@GetMetaData() mtdt: MetaData,
	): Promise<UserRecieve> {
		if (email !== this.cfg.get('ADMIN_EMAIL'))
			throw new ServerException('Invalid', 'Email', '');

		const { id } = await this.svc.hook.assign(mtdt, (signature: string) =>
			this.svc.mail.send(
				this.svc.cfg.get('ADMIN_EMAIL'),
				'Signature request',
				'sendSignatureAdmin',
				{ signature },
			),
		);

		return new UserRecieve({
			accessToken: id,
			response: { message: err('Success', 'Signature', 'Sent') },
		});
	}

	/**
	 * Change password
	 */
	@Throttle({ changePassword: { limit: 3, ttl: 240000 } })
	@Post('change-password/:token')
	@UseGuards(HookGuard)
	protected changePassword(
		@Param('token') signature: string,
		@Body() { password }: UserAuthencation,
		@GetMetaData() mtdt: MetaData,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		return super.changePassword(signature, { password }, mtdt, hook);
	}

	/**
	 * Send signature to email
	 */
	@Throttle({ changePasswordRequest: { limit: 1, ttl: 300000 } })
	@Post('change-password')
	protected async resetPasswordViaEmail(
		@GetRequest('hostname') hostname: string,
		@Body() { email }: BaseUserEmail,
		@GetMetaData() mtdt: MetaData,
	): Promise<UserRecieve> {
		return super.resetPasswordViaEmail(hostname, { email }, mtdt);
	}

	/**
	 * Request a csrf token
	 */
	@Get('csrf-token') getCsrfToken(
		@Res({ passthrough: true }) response: FastifyReply,
	) {
		return new UserRecieve({ response: { token: response.generateCsrf() } });
	}
}

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: TypeOrmHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private memory: MemoryHealthIndicator,
	) {}

	@Get() @HealthCheck() check() {
		return this.health.check([
			() => this.db.pingCheck('database'),
			() =>
				this.disk.checkStorage('storage', {
					path: join(__dirname),
					thresholdPercent: 0.75,
				}),
			() => this.memory.checkHeap('memory_heap', (365).mb2b),
			() => this.memory.checkRSS('memory_rss', (256).mb2b),
		]);
	}
}
