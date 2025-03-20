import { ConfigService } from '@nestjs/config';
import { AppMiddleware } from './app.middleware';
import { initJest } from 'app/utils/test.utils';
import { expect, it } from '@jest/globals';
import { createRequest, createResponse } from 'node-mocks-http';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { UserRecieve } from 'user/user.entity';

const acsTkn = (35).string + '@',
	rfsTkn = (35).string + '!';

let req: Request,
	res: Response,
	middleware: AppMiddleware,
	session: Map<string, any> = new Map();

beforeEach(async () => {
	const { module } = await initJest(),
		jwt = module.get(JwtService),
		config = module.get(ConfigService);

	middleware = new AppMiddleware(jwt, config);

	(req = createRequest()), (res = createResponse());
});

describe('auth', () => {
	beforeEach(() => {
		req['session'] = Object.assign(
			{},
			{
				set: (key: string, value: any) => session.set(key, value),
				get: (key: string) => session.get(key),
			},
		);
		req['cookies'] = {};
		req['unsignCookie'] = (i: String) => ({
			valid: true,
			value: i.split('.')[0],
		});
		res['setCookie'] = (key: string, value: string) => {
			req['cookies'][key] = value;
			return res;
		};

		middleware.cookie(
			req as unknown as FastifyRequest,
			res as unknown as FastifyReply,
			new UserRecieve({ refreshToken: rfsTkn, accessToken: acsTkn }),
			() => ({}),
		);
	});

	it('refresh', () => {
		req['ur' + 'l'] = '/refresh';

		middleware.auth(
			req as unknown as FastifyRequest,
			res as unknown as FastifyReply,
			() => ({}),
		),
			expect(
				middleware.verify(req.headers['authorization'].split(' ')[1], 'refresh')
					.refreshToken,
			).toBe(rfsTkn);
	});

	it('access', () => {
		middleware.auth(
			req as unknown as FastifyRequest,
			res as unknown as FastifyReply,
			() => ({}),
		),
			expect(
				middleware.verify(req.headers['authorization'].split(' ')[1], 'access')
					.accessToken,
			).toBe(acsTkn);
	});
});
