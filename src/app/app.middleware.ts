import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SecurityService } from 'app/utils/auth.utils';
import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';
import { UserRecieve } from 'user/user.entity';
import { cookieOptions } from './utils/server.utils';
import { UAParser } from 'ua-parser-js';
import { CookieSerializeOptions } from '@fastify/cookie';

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
			else if ('refresh' == cookieName) refresh = this.decrypt(value);
			else if ('access' == cookieName) access = this.decrypt(value, accessKey);
		}

		if (access || refresh)
			req.headers.authorization = `Bearer ${isRefresh ? refresh : access}`;

		delete req.headers.sessionId;
		try {
			if (access && this.verify(access).accessToken)
				req.headers.sessionId = req.session.get('sessionId') || '';
		} catch {}
		done();
	}

	/**
	 * Set metadata current request
	 */
	// eslint-disable-next-line tsEslint/no-unused-vars
	async setMetaData(req: FastifyRequest, res: FastifyReply) {
		req.metaData = await UAParser(req.headers).withFeatureCheck();
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
		const sessionId = req.session.get('sessionId');

		if (!sessionId) req.session.set('sessionId', (64).string);

		if (!(payload instanceof UserRecieve)) {
			done();
			return;
		}

		const {
				blocInfo = req.key?.blocInfo,
				HookId,
				response,
				isClearCookie = false,
			} = payload,
			accessKey = (32).string;

		if (isClearCookie) {
			['access', 'refresh'].forEach((i) => res.clearCookie(i));

			done(null, response);
			return;
		}

		const cookieOpts: CookieSerializeOptions = {
				...cookieOptions,
				maxAge: 2 ** 31,
			},
			{ hash = '', id = '' } = blocInfo || {};

		req.session.set('accessKey', this.encrypt(accessKey, req.ip));

		res.setCookie(
			'access',
			this.encrypt(
				this.access({ accessToken: HookId ? HookId : hash }),
				accessKey,
			),
			cookieOpts,
		);

		res.setCookie(
			'refresh',
			this.encrypt(this.refresh({ refreshToken: id })),
			cookieOpts,
		);

		done(null, response);
	}
}
