import { ConfigService } from '@nestjs/config';
import { hash } from 'app/utils/auth.utils';
import { NextFunction, Request, Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { initJest } from 'app/utils/test.utils';
import { expect } from '@jest/globals';

const acsTkn = '..access-token',
	rfsTkn = '..refresh-token';

let next: NextFunction,
	req: Request,
	res: Response,
	authMdw: AuthMiddleware,
	authSvc: AuthService,
	cfgSvc: ConfigService,
	acsKey: string,
	rfsKey: string;

beforeEach(async () => {
	const { module } = await initJest([], [AuthMiddleware]);

	(authMdw = module.get(AuthMiddleware)),
		(authSvc = module.get(AuthService)),
		(cfgSvc = module.get(ConfigService));

	(req = createRequest()),
		(res = createResponse()),
		(next = jest.fn()),
		(acsKey = cfgSvc.get('ACCESS_SECRET')),
		(rfsKey = cfgSvc.get('REFRESH_SECRET'));
});

describe('use', () => {
	beforeEach(async () => {
		req.cookies[`${await hash(rfsKey)}`] = authSvc.encrypt(rfsTkn);
		req.cookies[`${await hash(acsKey)}`] = authSvc.encrypt(
			acsTkn,
			rfsTkn.split('.')[2],
		);
	});

	it('refresh', async () => {
		req.url = '/refresh';
		await authMdw.use(req, res, next),
			expect(req.headers.authorization).toBe(`Bearer ${rfsTkn}`),
			expect(next).toHaveBeenCalled();
	});

	it('access', async () => {
		await authMdw.use(req, res, next),
			expect(req.headers.authorization).toBe(`Bearer ${acsTkn}`),
			expect(next).toHaveBeenCalled();
	});
});
