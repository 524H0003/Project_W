import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	Argon2Options,
	compare,
	hashing,
	SecurityService,
} from 'app/utils/auth.utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';

/**
 * App middleware
 */
@Injectable()
export class AppMiddleware extends SecurityService {
	private hashOpts: Argon2Options = {
		hashLength: 6,
		parallelism: 1,
		timeCost: 3,
		memoryCost: 2 << 9,
	};

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
	async auth(req: FastifyRequest, res: FastifyReply) {
		const isRefresh = this.rfsgrd.test(req.url),
			{ memoryCost, parallelism, timeCost } = this.hashOpts,
			argon2Header = `$argon2id$v=19$m=${memoryCost},t=${timeCost},p=${parallelism}$`,
			accessKey = req.session.get<any>('accessKey');

		let access: string = '',
			refresh: string = '';
		for (const cookie in req.cookies)
			if (
				await compare(
					this.config.get('REFRESH_SECRET') + '!',
					argon2Header + cookie.fromBase64Url,
				)
			) {
				refresh = this.decrypt(req.cookies[cookie]);
				res.clearCookie(cookie);
			} else if (
				await compare(
					this.config.get('ACCESS_SECRET'),
					argon2Header + cookie.fromBase64Url,
				)
			) {
				access = this.decrypt(req.cookies[cookie], accessKey);
				res.clearCookie(cookie);
			}

		if (access || refresh)
			req.headers.authorization = `Bearer ${isRefresh ? refresh : access}`;
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

	async cookie(req: FastifyRequest, res: FastifyReply) {
		const { access = '', refresh = (36).string, data } = res,
			accessKey = (66).string;

		if (access.length == 36 && refresh.length == 36) {
			req.session.set<any>('accessKey', accessKey);
			res
				.cookie(
					(await hashing(this.config.get('ACCESS_SECRET'), this.hashOpts))
						.redudeArgon2.toBase64Url,
					this.encrypt(this.access(access), accessKey),
				)
				.cookie(
					(
						await hashing(
							this.config.get('REFRESH_SECRET') + '!',
							this.hashOpts,
						)
					).redudeArgon2.toBase64Url,
					this.encrypt(this.refresh(refresh)),
				)
				.send({ data });
		}

		delete res.access, res.refresh, res.data;
	}
}
