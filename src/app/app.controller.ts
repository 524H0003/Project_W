import {
	Body,
	Controller,
	forwardRef,
	Get,
	HttpStatus,
	Inject,
	Param,
	ParseFilePipeBuilder,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserRecieve } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from './interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import type { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { UserAuthencation, UserLogIn, UserSignUp } from 'user/user.dto';
import { Throttle } from '@nestjs/throttler';
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
	GetRequest,
	HookGuard,
	type IRefreshResult,
	LocalhostGuard,
	type MetaData,
	RefreshGuard,
} from 'auth/guards';
import { BaseUserEmail } from 'user/base/baseUser.dto';
import { StudentController } from 'university/student/student.controller';
import { BaseController } from './base.app.controller';
import { ApiSecurity } from '@nestjs/swagger';

/**
 * Application Controller
 */
@Controller({ version: '1', path: '' })
export class AppController extends BaseController {
	/**
	 * Initiate controller
	 * @param {AppService} svc - general app service
	 * @param {ConfigService} cfg - general app config
	 */
	constructor(
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
		protected cfg: ConfigService,
		private studentController: StudentController,
	) {
		super(svc, cfg);
	}

	/**
	 * Login request
	 */

	@ApiSecurity('CsrfToken')
	@Post('login')
	@UseInterceptors(FileInterceptor())
	async login(
		@Body() body: UserLogIn,
		@GetRequest('metaData') mtdt: MetaData,
		@GetRequest('hostname') hostname: string,
	): Promise<UserRecieve> {
		try {
			return await this.studentController.signUp(body, mtdt, hostname);
		} catch (error) {
			const { message } = error as ServerException;
			switch (true) {
				case message.includes(err('Invalid', 'User', 'SignUp')):
					const user = await this.svc.auth.login(body),
						{ id, hash } = await this.svc.bloc.assign(user, { mtdt });

					return new UserRecieve({
						blocInfo: { id, hash },
						response: await this.svc.user.info(user.id),
					});

				default:
					throw error;
			}
		}
	}

	/**
	 * Sign up request
	 */
	@ApiSecurity('CsrfToken')
	@Post('sign-up')
	@UseGuards(LocalhostGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Body() body: UserSignUp,
		@GetRequest('metaData') mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<UserRecieve> {
		const user = await this.svc.auth.signUp(body, avatar || null),
			{ id, hash } = await this.svc.bloc.assign(user, { mtdt });

		return new UserRecieve({
			blocInfo: { id, hash },
			response: await this.svc.user.info(user.id),
		});
	}

	/**
	 * Logout request
	 */
	@ApiSecurity('CsrfToken')
	@Post('logout')
	@UseGuards(RefreshGuard)
	async logout(
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<UserRecieve> {
		const { blocId } = refresh;

		await this.svc.bloc.removeSnake(blocId);

		return new UserRecieve({
			isClearCookie: true,
			response: { message: err('Success', 'User', 'LogOut') },
		});
	}

	/**
	 * Refreshing tokens request
	 */
	@ApiSecurity('CsrfToken')
	@Post('refresh')
	@UseGuards(RefreshGuard)
	async refresh(
		@GetRequest('metaData') mtdt: MetaData,
		@GetRequest('refresh') refresh: IRefreshResult,
	): Promise<UserRecieve> {
		const { metaData, blocHash, blocId } = refresh;

		if (!compareMetaData(metaData, mtdt)) {
			await this.svc.bloc.removeSnake(blocId);
			return new UserRecieve({
				isClearCookie: true,
				response: { message: err('Invalid', 'Client', '') },
			});
		}

		return new UserRecieve({
			blocInfo: { id: blocId, hash: blocHash },
			response: { message: err('Success', 'Client', 'Request') },
		});
	}

	/**
	 * Change password via console
	 */
	@Throttle({ requestSignature: { limit: 1, ttl: 600000 } })
	@ApiSecurity('CsrfToken')
	@Post('request-signature')
	protected async requestSignatureViaConsole(
		@Body() { email }: BaseUserEmail,
		@GetRequest('metaData') mtdt: MetaData,
	): Promise<UserRecieve> {
		if (email !== this.cfg.get('ADMIN_EMAIL'))
			throw new ServerException('Invalid', 'Email', '');

		const { id } = await this.svc.hook.assign(mtdt, (signature: string) =>
			this.svc.mail.send(
				this.svc.config.get('ADMIN_EMAIL'),
				'Signature request',
				'sendSignatureAdmin',
				{ signature },
			),
		);

		return new UserRecieve({
			HookId: id,
			response: { message: err('Success', 'Signature', 'Sent') },
		});
	}

	/**
	 * Change password
	 */
	@Throttle({ changePassword: { limit: 3, ttl: 240000 } })
	@ApiSecurity('CsrfToken')
	@Post('change-password/:token')
	@UseGuards(HookGuard)
	protected changePassword(
		@Param('token') signature: string,
		@Body() { password }: UserAuthencation,
		@GetRequest('metaData') mtdt: MetaData,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		return super.changePassword(signature, { password }, mtdt, hook);
	}

	/**
	 * Send signature to email
	 */
	@Throttle({ changePasswordRequest: { limit: 1, ttl: 300000 } })
	@ApiSecurity('CsrfToken')
	@Post('change-password')
	protected async resetPasswordViaEmail(
		@GetRequest('hostname') hostname: string,
		@Body() { email }: BaseUserEmail,
		@GetRequest('metaData') mtdt: MetaData,
	): Promise<UserRecieve> {
		return super.resetPasswordViaEmail(hostname, { email }, mtdt);
	}

	/**
	 * Request a csrf token
	 */
	@Get('csrf-token') getCsrfToken() {}
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
					path: join(process.cwd()),
					thresholdPercent: 0.75,
				}),
			() => this.memory.checkHeap('memory_heap', (256).mb2b),
			() => this.memory.checkRSS('memory_rss', (400).mb2b),
		]);
	}
}

/**
 * Server global avatar file upload properties
 */
export const AvatarFileUpload = new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
	.addMaxSizeValidator({ maxSize: (0.3).mb2b })
	.build({
		fileIsRequired: false,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	});
