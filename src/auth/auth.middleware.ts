import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { Cryption } from 'utils/auth.utils';

@Injectable()
export class AuthMiddleware extends Cryption implements NestMiddleware {
	constructor(
		private cfgSvc: ConfigService,
		private jwtSvc: JwtService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}
	private readonly rfsgrd = /\/(auth){1}\/(logout|refresh){1}/gi;
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	async use(req: Request, res: Response, next: NextFunction) {
		const isRefresh = req.url.match(this.rfsgrd);

		let acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies)
			if (compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)))
				rfsTkn = req.cookies[cki];
			else if (compareSync(this.acsKey, cki.substring(this.ckiPfx.length)))
				acsTkn = req.cookies[cki];

		const tknPld = this.decrypt(rfsTkn);
		req.headers.authorization = `Bearer ${!isRefresh ? this.decrypt(acsTkn, tknPld.split('.')[2]) : tknPld}`;

		try {
			req.user = await this.jwtSvc.verify(
				this.decrypt(acsTkn, tknPld.split('.')[2]),
			);
		} catch {}

		next();
	}
}
