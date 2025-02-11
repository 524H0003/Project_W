import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'user/user.model';
import { AccessGuard } from './access.guard';
import { execute, initJest } from 'app/utils/test.utils';
import { expect } from '@jest/globals';

let roleGrd: AccessGuard, rflt: Reflector, ctx: ExecutionContext;

beforeEach(async () => {
	const { module } = await initJest();

	(roleGrd = module.get(AccessGuard)),
		(rflt = module.get(Reflector)),
		(ctx = {
			getHandler: jest.fn().mockReturnValue({}),
			getClass: jest.fn().mockReturnValue({}),
		} as unknown as ExecutionContext);
});

describe('canActivate', () => {
	beforeEach(() => {
		jest
			.spyOn(AuthGuard('access').prototype, 'canActivate')
			.mockImplementation(() => true);
	});

	it('success when AllowPublic is set', async () => {
		jest.spyOn(rflt, 'get').mockReturnValueOnce(true);
		expect(await roleGrd.canActivate(ctx)).toBe(true);
	});

	it("success when user's role match the allowance roles", async () => {
		const req = { user: { role: UserRole.faculty } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.faculty])
			.mockReturnValueOnce(null),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(true);
	});

	it("fail when user's role match the forbiddance roles", async () => {
		const req = { user: { role: UserRole.faculty } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(null)
			.mockReturnValueOnce([UserRole.faculty]),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(false);
	});

	it("fail when user's roles not match the required roles", async () => {
		const req = { user: { role: UserRole.student } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.faculty]),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(false);
	});

	it('success when allowance and forbiddance roles not defined', async () => {
		const req = { user: { role: UserRole.student } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(null)
			.mockReturnValueOnce(null),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(true);
	});

	it('fail when allowance and forbiddance roles have same child', async () => {
		const req = { user: { role: UserRole.student } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.admin])
			.mockReturnValueOnce([UserRole.admin]),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		await execute(() => roleGrd.canActivate(ctx), {
			exps: [
				{ type: 'toThrow', params: [err('Fatal', 'Method', 'Implementation')] },
			],
		});
	});
});
