import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cryption } from 'app/utils/auth.utils';
import { compareSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { SignService } from './auth.service';

@Injectable()
export class AuthMiddleware extends Cryption implements NestMiddleware {
	constructor(
		private cfgSvc: ConfigService,
		private signSvc: SignService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}
	private readonly rfsgrd = /\/(auth){1}\/(logout|refresh){1}/gi;
	private readonly rfsKey = this.cfgSvc.get('REFRESH_SECRET');
	private readonly acsKey = this.cfgSvc.get('ACCESS_SECRET');

	async use(req: Request, res: Response, next: NextFunction) {
		const isRefresh = req.url.match(this.rfsgrd);

		let acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies)
			if (compareSync(this.rfsKey, cki)) rfsTkn = req.cookies[cki];
			else if (compareSync(this.acsKey, cki)) acsTkn = req.cookies[cki];

		const tknPld = this.decrypt(rfsTkn);
		req.headers.authorization = `Bearer ${!isRefresh ? this.decrypt(acsTkn, tknPld.split('.')[2]) : tknPld}`;

		try {
			req.user = await this.signSvc.verify(
				this.decrypt(acsTkn, tknPld.split('.')[2]),
			);
		} catch {}

		next();
	}
}
