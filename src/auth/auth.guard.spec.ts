import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'app/module/test.module';
import { UserRole } from 'user/user.model';
import { RoleGuard } from './auth.guard';
import { AppModule } from 'app/app.module';

let roleGrd: RoleGuard, rflt: Reflector, ctx: ExecutionContext;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	(roleGrd = module.get(RoleGuard)),
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

	it("success when user's role match the required roles", async () => {
		const req = { user: { role: UserRole.faculty } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.faculty]),
			jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(true);
	});

	it("fail due to user's roles not match the required roles", async () => {
		const req = { user: { role: UserRole.student } };
		jest
			.spyOn(rflt, 'get')
			.mockReturnValueOnce(false)
			.mockReturnValueOnce([UserRole.faculty]);
		jest.spyOn(roleGrd, 'getRequest').mockReturnValueOnce(req);
		expect(await roleGrd.canActivate(ctx)).toBe(false);
	});

	it('fail due to roles are not defined', async () => {
		await expect(roleGrd.canActivate(ctx)).rejects.toThrow(
			InternalServerErrorException,
		);
	});
});
