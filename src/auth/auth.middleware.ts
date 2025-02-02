import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, Cryption } from 'app/utils/auth.utils';
import { SignService } from './auth.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';

/**
 * Auth middleware
 */
@Injectable()
export class AuthMiddleware extends Cryption implements NestMiddleware {
	/**
	 * Initiate auth middleware
	 */
	constructor(
		private cfgSvc: ConfigService,
		private signSvc: SignService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}
	/**
	 * @ignore
	 */
	private readonly rfsgrd = /(logout|refresh){1}/gi;
	/**
	 * @ignore
	 */
	private readonly rfsKey = this.cfgSvc.get('REFRESH_SECRET');
	/**
	 * @ignore
	 */
	private readonly acsKey = this.cfgSvc.get('ACCESS_SECRET');

	/**
	 * Auth middleware processing request
	 * @param {FastifyRequest} req - client's request
	 * @param {FastifyReply} res - server's response
	 */
	async use(req: FastifyRequest, res: FastifyReply) {
		const isRefresh = req.url.match(this.rfsgrd),
			{ authorization } = req.headers;

		let access: string, refresh: string;
		for (const cookie in req.cookies)
			if (await compare(this.rfsKey, cookie)) refresh = req.cookies[cookie];
			else if (await compare(this.acsKey, cookie)) access = req.cookies[cookie];

		if (access || refresh)
			req.headers.authorization = `Bearer ${this.decrypt(isRefresh ? refresh : access)}`;
		else if (authorization)
			req.headers.authorization = `Bearer ${this.decrypt(authorization.split(' ').at(-1))}`;

		if (req['isMultipart'] && req.url === '/graphql')
			req.body = await processRequest(req.raw, res.raw, {
				maxFileSize: 10000000, // 10 MB
				maxFiles: 20,
			});
	}
}
