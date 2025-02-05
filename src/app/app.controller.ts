import {
	Body,
	Controller,
	forwardRef,
	Get,
	Inject,
	Param,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { GetRequest, MetaData } from 'auth/guards/access.guard';
import { Hook } from 'app/hook/hook.entity';
import { AppService } from './app.service';
import { UserRecieve } from 'user/user.entity';
import { compare } from './utils/auth.utils';
import { Throttle } from '@nestjs/throttler';
import { AvatarFileUpload, BaseController } from './utils/controller.utils';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FileInterceptor } from './interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards/hook.guard';
import { RefreshGuard } from 'auth/guards/refresh.guard';
import { LocalhostGuard } from 'auth/guards/localhost.guard';
import { UserAuthencation, UserSignUp } from 'user/user.dto';
import { BaseUserEmail } from './app.dto';

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
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: UserSignUp,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			switch ((error as ServerException).message) {
				case err('Invalid', 'User', 'SignUp'):
					return this.responseWithUser(
						request,
						response,
						await this.svc.auth.login(body),
						mtdt,
					);

				case err('Success', 'User', 'SignUp'):
					return this.resetPasswordViaEmail(request, response, body, mtdt);

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
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: UserSignUp,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<void> {
		return this.responseWithUser(
			request,
			response,
			await this.svc.auth.signUp(body, avatar || null),
			mtdt,
		);
	}

	/**
	 * Logout request
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @return {Promise<void>}
	 */
	@Post('logout') @UseGuards(RefreshGuard) async logout(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
	): Promise<void> {
		const { sessionId } = request.refresh;

		await this.svc.device.remove({
			id: (await this.svc.session.id(sessionId)).device.id,
		});

		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: err('Success', 'User', 'LogOut') }),
		);
	}

	/**
	 * Refreshing tokens request
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('refresh') @UseGuards(RefreshGuard) async refresh(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@MetaData() mtdt: string,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
				this.responseWithUserRecieve(request, response, usrRcv),
			{ sessionId, status, hashedUserAgent } = request.refresh;

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
	 * Send signature to email
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Throttle({ changePasswordRequest: { limit: 1, ttl: 300000 } })
	@Post('change-password')
	async resetPasswordViaEmail(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { email }: BaseUserEmail,
		@MetaData() mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.hook.assign(mtdt, async (s: string) => {
				const user = await this.svc.baseUser.email(email);

				if (!user) throw new ServerException('Invalid', 'Email', '', 'user');
				return this.svc.mail.send(email, 'Change password?', 'forgetPassword', {
					name: user.name,
					url: `${request.hostname}/hook/${s}`,
				});
			}),
		);
	}

	/**
	 * Change password
	 */
	@Throttle({ changePassword: { limit: 3, ttl: 240000 } })
	@Post('change-password/:token')
	@UseGuards(HookGuard)
	async changePassword(
		@Param('token') signature: string,
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { password }: UserAuthencation,
		@MetaData() mtdt: string,
		@GetRequest('hook') hook: Hook,
	): Promise<void> {
		try {
			await this.svc.hook.validating(signature, mtdt, hook);

			const user = await this.svc.user.findOne({
				baseUser: { email: hook.fromBaseUser.email },
			});

			if (await this.svc.auth.changePassword(user, password)) {
				return this.responseWithUserRecieve(
					request,
					response,
					new UserRecieve({ response: 'Success_Change_Password' }),
				);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Change password via console
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Throttle({ requestSignature: { limit: 1, ttl: 600000 } })
	@Post('request-signature')
	async requestSignatureViaConsole(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { email }: BaseUserEmail,
		@MetaData() mtdt: string,
	): Promise<void> {
		if (email == this.cfg.get('ADMIN_EMAIL'))
			return this.responseWithUserRecieve(
				request,
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
		throw new ServerException('Invalid', 'Email', '', 'user');
	}

	/**
	 * Check server status
	 */
	@Get('status')
	serverStatus(@Res({ passthrough: true }) response: FastifyReply) {
		response.send({ status: 'OK' });
	}
}
