import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from 'app/utils/auth.utils';
import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';
import { UserRecieve } from 'user/user.entity';
import { cookieOptions } from './utils/server.utils';

/**
 * App middleware
 */
@Injectable()
export class AppMiddleware extends SecurityService {
	/**
	 * Initiate auth middleware
	 */
	constructor(
		protected jwt: JwtService,
		protected config: ConfigService,
	) {
		super(jwt, config);
	}

	/**
	 * Refresh guard regular expression
	 */
	private readonly rfsgrd = /^\/(api\/v1\/)?(logout|refresh){1}$/;

	/**
	 * Authenticate processing
	 */
	auth(req: FastifyRequest, res: FastifyReply, done: DoneFuncWithErrOrRes) {
		const isRefresh = this.rfsgrd.test(req.url),
			accessKey = this.decrypt(req.session.get<any>('accessKey'), req.ip);

		let access: string = '',
			refresh: string = '';
		for (const cookieName in req.cookies) {
			const { valid, value } = req.unsignCookie(req.cookies[cookieName]);

			if (!valid) continue;

			if ('refresh' == cookieName) {
				res.clearCookie(cookieName);
				refresh = this.decrypt(value);
			} else if ('access' == cookieName) {
				res.clearCookie(cookieName);
				access = this.decrypt(value, accessKey);
			}
		}

		if (access || refresh)
			req.headers.authorization = `Bearer ${isRefresh ? refresh : access}`;

		done();
	}

	async graphQl(req: FastifyRequest, res: FastifyReply) {
		if (req.url === '/graphql') {
			if (typeof req.isMultipart == 'boolean' && req.isMultipart)
				req.body = await processRequest(req.raw, res.raw, {
					maxFileSize: (50).mb2b,
				});
		}
	}

	cookie(
		req: FastifyRequest,
		res: FastifyReply,
		payload: UserRecieve,
		done: DoneFuncWithErrOrRes,
	) {
		if (payload instanceof UserRecieve) {
			const { accessToken = '', refreshToken = '', response } = payload,
				accessKey = (32).string;

			req.session.set<any>('accessKey', this.encrypt(accessKey, req.ip));
			res
				.setCookie(
					'access',
					this.encrypt(this.access({ accessToken }), accessKey),
					cookieOptions,
				)
				.setCookie(
					'refresh',
					this.encrypt(this.refresh({ refreshToken })),
					cookieOptions,
				);
			done(null, response);
		} else done();
	}
}
