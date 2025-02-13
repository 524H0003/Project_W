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
import { GetRequest, MetaData } from 'auth/guards/access.guard';
import { AppService } from './app.service';
import { UserRecieve } from 'user/user.entity';
import { compare } from './utils/auth.utils';
import { AvatarFileUpload, BaseController } from './utils/controller.utils';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { FileInterceptor } from './interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { RefreshGuard } from 'auth/guards/refresh.guard';
import { LocalhostGuard } from 'auth/guards/localhost.guard';
import { UserAuthencation, UserLogIn, UserSignUp } from 'user/user.dto';
import { Throttle } from '@nestjs/throttler';
import { BaseUserEmail } from './app.dto';
import { Hook } from './hook/hook.entity';
import { HookGuard } from 'auth/guards/hook.guard';
import { IRefreshResult } from 'auth/guards/refresh.strategy';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { join } from 'path';

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
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: UserLogIn,
		@MetaData() mtdt: string,
		@GetRequest('hostname') hostname: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			const { message } = error as ServerException;
			switch (true) {
				case message.includes(err('Invalid', 'User', 'SignUp')):
					return this.responseWithUser(
						response,
						await this.svc.auth.login(body),
						mtdt,
					);

				case message.includes(err('Success', 'User', 'SignUp')):
					return this.resetPasswordViaEmail(response, hostname, body, mtdt);

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
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: UserSignUp,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<void> {
		return this.responseWithUser(
			response,
			await this.svc.auth.signUp(body, avatar || null),
			mtdt,
		);
	}

	/**
	 * Logout request
	 */
	@Post('logout') @UseGuards(RefreshGuard) async logout(
		@Res({ passthrough: true }) response: FastifyReply,
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<void> {
		const { sessionId } = refresh;

		await this.svc.device.remove({
			id: (await this.svc.session.id(sessionId)).device.id,
		});

		return this.responseWithUserRecieve(
			response,
			new UserRecieve({ response: err('Success', 'User', 'LogOut') }),
		);
	}

	/**
	 * Refreshing tokens request
	 */
	@Post('refresh') @UseGuards(RefreshGuard) async refresh(
		@Res({ passthrough: true }) response: FastifyReply,
		@MetaData() mtdt: string,
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
				this.responseWithUserRecieve(response, usrRcv),
			{ sessionId, status, hashedUserAgent } = refresh;

		if (status === 'lockdown') {
			await this.svc.device.remove({
				id: (await this.svc.session.id(sessionId)).device.id,
			});
			return sendBack(new UserRecieve({ response: 'LockdownAccount' }));
		} else {
			if (status === 'success' && compare(mtdt, hashedUserAgent))
				return sendBack(await this.svc.session.rotateToken(sessionId));
			else return sendBack(await this.svc.session.addTokens(sessionId));
		}
	}

	/**
	 * Change password via console
	 */
	@Throttle({ requestSignature: { limit: 1, ttl: 600000 } })
	@Post('request-signature')
	protected async requestSignatureViaConsole(
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { email }: BaseUserEmail,
		@MetaData() mtdt: string,
	): Promise<void> {
		if (email == this.cfg.get('ADMIN_EMAIL'))
			return this.responseWithUserRecieve(
				response,
				await this.svc.hook.assign(mtdt, (signature: string) =>
					this.svc.mail.send(
						this.svc.cfg.get('ADMIN_EMAIL'),
						'Signature request',
						'sendSignatureAdmin',
						{ signature },
					),
				),
			);
		throw new ServerException('Invalid', 'Email', '');
	}

	/**
	 * Change password
	 */
	@Throttle({ changePassword: { limit: 3, ttl: 240000 } })
	@Post('change-password/:token')
	@UseGuards(HookGuard)
	protected async changePassword(
		@Param('token') signature: string,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { password }: UserAuthencation,
		@MetaData() mtdt: string,
		@GetRequest('hook') hook: Hook,
	): Promise<void> {
		await super.changePassword(signature, response, { password }, mtdt, hook);
	}

	/**
	 * Send signature to email
	 */
	@Throttle({ changePasswordRequest: { limit: 1, ttl: 300000 } })
	@Post('change-password')
	protected async resetPasswordViaEmail(
		@Res({ passthrough: true }) response: FastifyReply,
		@GetRequest('hostname') hostname: string,
		@Body() { email }: BaseUserEmail,
		@MetaData() mtdt: string,
	): Promise<void> {
		return super.resetPasswordViaEmail(response, hostname, { email }, mtdt);
	}

	/**
	 * Request a csrf token
	 */
	@Get('csrf-token') getCsrfToken(
		@Res({ passthrough: true }) response: FastifyReply,
	) {
		response.send({ token: response.generateCsrf() });
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

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([
			() => this.db.pingCheck('database'),
			() =>
				this.disk.checkStorage('storage', {
					path: join(__dirname),
					thresholdPercent: 0.75,
				}),
			() => this.memory.checkHeap('memory_heap', (365).mb2b),
			() => this.memory.checkRSS('memory_rss', (128).mb2b),
		]);
	}
}
