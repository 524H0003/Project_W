import { AppService } from 'app/app.service';
import { User } from './user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { UserRole } from './user.model';

const fileName = curFile(__filename);

let appSvc: AppService, user: User;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	user = User.test(fileName);
	if (user.hashedPassword) true;
});

describe('UserService', () => {
	it('assign', async () => {
		await execute(() => appSvc.usr.assign(user), {
			exps: [{ type: 'toBeInstanceOf', params: [User] }],
			onFinish: async (result: User) => {
				await execute(() => appSvc.baseUser.find(result.baseUser), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
				await execute(() => appSvc.usr.email(result.baseUser.email), {
					exps: [
						{
							type: 'toHaveProperty',
							params: ['baseUser.email', result.baseUser.email],
						},
					],
				});
				await execute(() => appSvc.usr.id(result.baseUser.id), {
					exps: [
						{
							type: 'toHaveProperty',
							params: ['baseUser.email', result.baseUser.email],
						},
					],
				});
			},
		});
	});

	it('modify', async () => {
		const dbUser = await appSvc.usr.assign(user),
			newName = (20).string;

		await execute(
			() =>
				appSvc.usr.modify(dbUser.baseUser.id, { baseUser: { name: newName } }),
			{
				exps: [
					{ type: 'toBeInstanceOf', params: [User] },
					{ type: 'toHaveProperty', params: ['baseUser.name', newName] },
				],
			},
		);
	});

	it('remove', async () => {
		const dbUser = await appSvc.usr.assign(user);

		// eslint-disable-next-line @typescript-eslint/require-await
		await execute(async () => () => appSvc.usr.remove(dbUser), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
		await execute(() => appSvc.usr.id(dbUser.baseUser.id), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('updateRole', async () => {
		const dbUser = await appSvc.usr.assign(user);

		await execute(
			() => appSvc.usr.updateRole(dbUser.baseUser.id, UserRole.admin),
			{
				exps: [
					{ type: 'toBeInstanceOf', params: [User] },
					{ type: 'toHaveProperty', params: ['role', UserRole.admin] },
				],
			},
		);
	});
});
