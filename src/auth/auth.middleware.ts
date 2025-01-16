import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, Cryption } from 'app/utils/auth.utils';
import { NextFunction, Request, Response } from 'express';
import { SignService } from './auth.service';

/**
 * Auth middleware
 */
@Injectable()
export class AuthMiddleware extends Cryption implements NestMiddleware {
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
	 * @param {Request} req - client's request
	 * @param {Response} res - server's response
	 * @param {NextFunction} next - continueing processing client's request
	 */
	use(req: Request, res: Response, next: NextFunction) {
		const isRefresh = req.url.match(this.rfsgrd);

		let acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies)
			if (compare(this.rfsKey, cki)) rfsTkn = req.cookies[cki];
			else if (compare(this.acsKey, cki)) acsTkn = req.cookies[cki];

		const tknPld = this.decrypt(rfsTkn);
		if (!req.headers.authorization)
			req.headers.authorization = `Bearer ${!isRefresh ? this.decrypt(acsTkn, tknPld.split('.')[2]) : tknPld}`;

		try {
			req.user = this.signSvc.verify(
				this.decrypt(acsTkn, tknPld.split('.')[2]),
			);
		} catch {}

		next();
	}
}
