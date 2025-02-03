import { ConfigService } from '@nestjs/config';
import { hash } from 'app/utils/auth.utils';
import { AuthMiddleware } from './auth.middleware';
import { AuthService, SignService } from './auth.service';
import { initJest } from 'app/utils/test.utils';
import { expect } from '@jest/globals';
import { createRequest, createResponse } from 'node-mocks-http';
import { FastifyReply, FastifyRequest } from 'fastify';

const acsTkn = '..access-token',
	rfsTkn = '..refresh-token';

let req: Request,
	res: Response,
	authMdw: AuthMiddleware,
	authSvc: AuthService,
	cfgSvc: ConfigService,
	signSvc: SignService,
	acsKey: string,
	rfsKey: string;

beforeEach(async () => {
	const { module } = await initJest();

	(authSvc = module.get(AuthService)),
		(cfgSvc = module.get(ConfigService)),
		(signSvc = module.get(SignService)),
		(authMdw = new AuthMiddleware(cfgSvc, signSvc));

	(req = createRequest()),
		(res = createResponse()),
		(acsKey = cfgSvc.get('ACCESS_SECRET')),
		(rfsKey = cfgSvc.get('REFRESH_SECRET'));
});

describe('use', () => {
	beforeEach(async () => {
		req['cookies'][`${await hash(rfsKey)}`] = authSvc.encrypt(rfsTkn);
		req['cookies'][`${await hash(acsKey)}`] = authSvc.encrypt(acsTkn);
	});

	it('refresh', async () => {
		Object.assign(req, { url: '/refresh' });

		await authMdw.use(
			req as unknown as FastifyRequest,
			res as unknown as FastifyReply,
		),
			expect(req.headers['authorization']).toBe(`Bearer ${rfsTkn}`);
	});

	it('access', async () => {
		await authMdw.use(
			req as unknown as FastifyRequest,
			res as unknown as FastifyReply,
		),
			expect(req.headers['authorization']).toBe(`Bearer ${acsTkn}`);
	});
});
