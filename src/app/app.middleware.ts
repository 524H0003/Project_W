import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from 'app/utils/auth.utils';
import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';
import { UserRecieve } from 'user/user.entity';

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
			accessKey = this.decrypt(
				req.session.get<any>('accessKey'),
				req.ips?.join(';') || req.ip,
			);

		let access: string = '',
			refresh: string = '';
		for (const cookie in req.cookies)
			if ('refresh' == cookie) {
				res.clearCookie(cookie);
				refresh = this.decrypt(req.cookies[cookie]);
			} else if ('access' == cookie) {
				res.clearCookie(cookie);
				access = this.decrypt(req.cookies[cookie], accessKey);
			}

		if (access || refresh)
			req.headers.authorization = `Bearer ${isRefresh ? refresh : access}`;

		done();
	}

	async graphQl(req: FastifyRequest, res: FastifyReply) {
		if (
			typeof req.isMultipart == 'boolean' &&
			req.isMultipart &&
			req.url === '/graphql'
		)
			req.body = await processRequest(req.raw, res.raw, {
				maxFileSize: (50).mb2b,
			});
	}

	cookie(
		req: FastifyRequest,
		res: FastifyReply,
		payload: UserRecieve,
		done: DoneFuncWithErrOrRes,
	) {
		if (payload instanceof UserRecieve) {
			const {
					accessToken = '',
					refreshToken = (36).string,
					response,
				} = payload,
				accessKey = (66).string;

			if (accessToken.length == 36 && refreshToken.length == 36) {
				req.session.set<any>(
					'accessKey',
					this.encrypt(accessKey, req.ips?.join(';') || req.ip),
				);
				res
					.setCookie(
						'access',
						this.encrypt(this.access({ accessToken }), accessKey),
					)
					.setCookie('refresh', this.encrypt(this.refresh({ refreshToken })));
			}
			done(null, response);
		} else done();
	}
}
