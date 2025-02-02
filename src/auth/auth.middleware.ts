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
	 * @param {NextFunction} next - continueing processing client's request
	 */
	async use(req: FastifyRequest, res: FastifyReply, next: Function) {
		const isRefresh = req.url.match(this.rfsgrd);

		let access: string, refresh: string;
		for (const cookie in req.cookies)
			if (await compare(this.rfsKey, cookie)) refresh = req.cookies[cookie];
			else if (await compare(this.acsKey, cookie)) access = req.cookies[cookie];

		if (!req.headers.authorization)
			req.headers.authorization = `Bearer ${this.decrypt(isRefresh ? refresh : access)}`;

		try {
			req.token = this.signSvc.verify(this.decrypt(access));
		} catch {}

		if (req['isMultipart'])
			req.body = await processRequest(req.raw, res.raw, {
				maxFileSize: 10000000, // 10 MB
				maxFiles: 20,
			});

		next();
	}
}
