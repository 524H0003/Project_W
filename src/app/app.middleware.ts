import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, Cryption } from 'app/utils/auth.utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';

/**
 * App middleware
 */
@Injectable()
export class AppMiddleware extends Cryption implements NestMiddleware {
	/**
	 * Initiate auth middleware
	 */
	constructor(private config: ConfigService) {
		super(config.get('AES_ALGO'), config.get('SERVER_SECRET'));
	}

	/**
	 * Refresh guard regular expression
	 */
	private readonly rfsgrd = /^\/(api\/v1\/)?(logout|refresh){1}$/;

	/**
	 * App middleware processing request
	 * @param {FastifyRequest} req - client's request
	 * @param {FastifyReply} res - server's response
	 */
	async use(req: FastifyRequest, res: FastifyReply) {
		const isRefresh = this.rfsgrd.test(req.url);

		let access: string = '',
			refresh: string = '';
		for (const cookie in req.cookies)
			if (
				await compare(
					this.config.get('REFRESH_SECRET') + '!',
					cookie,
					'base64url',
				)
			)
				refresh = req.cookies[cookie];
			else if (
				await compare(this.config.get('ACCESS_SECRET'), cookie, 'base64url')
			)
				access = this.decrypt(req.cookies[cookie]);

		refresh = this.decrypt(refresh, access.split('.').at(-1));

		if (access || refresh)
			req.headers.authorization = `Bearer ${isRefresh ? refresh : access}`;

		if (
			typeof req.isMultipart == 'boolean' &&
			req.isMultipart &&
			req.url === '/graphql'
		)
			req.body = await processRequest(req.raw, res.raw, {
				maxFileSize: (50).mb2b,
			});
	}
}
