import { AppService } from 'app/app.service';
import { User } from './user.entity';
import { execute, initJest } from 'app/utils/test.utils';
import { UserRole } from './user.model';

const fileName = curFile(__filename);

let svc: AppService, user: User;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	user = User.test(fileName);
});

it('assign', async () => {
	await execute(() => svc.user.assign({ ...user, ...user.baseUser }), {
		exps: [{ type: 'toBeInstanceOf', params: [User] }],
		onFinish: async (result: User) => {
			await execute(() => svc.baseUser.find(result.baseUser), {
				exps: [{ type: 'toHaveLength', params: [1] }],
			});
			await execute(() => svc.user.email(result.baseUser.email), {
				exps: [
					{
						type: 'toHaveProperty',
						params: ['baseUser.email', result.baseUser.email],
					},
				],
			});
			await execute(() => svc.user.id(result.id), {
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
	const dbUser = await svc.user.assign({ ...user, ...user.baseUser }),
		newName = (20).string;

	await execute(
		() => svc.user.modify(dbUser.id, { baseUser: { name: newName } }),
		{
			exps: [
				{ type: 'toBeInstanceOf', params: [User] },
				{ type: 'toHaveProperty', params: ['baseUser.name', newName] },
			],
		},
	);
});

it('remove', async () => {
	const dbUser = await svc.user.assign({ ...user, ...user.baseUser });

	await execute(() => svc.user.remove(dbUser.id), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(async () => (await svc.user.id(dbUser.id)).isNull(), {
		exps: [{ type: 'toBe', params: [true] }],
	});
});

it('updateRole', async () => {
	const dbUser = await svc.user.assign({ ...user, ...user.baseUser });

	await execute(() => svc.user.updateRole(dbUser.id, UserRole.admin), {
		exps: [
			{ type: 'toBeInstanceOf', params: [User] },
			{ type: 'toHaveProperty', params: ['role', UserRole.admin] },
		],
	});
});
