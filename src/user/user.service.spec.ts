import { AppService } from 'app/app.service';
import { User } from './user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';

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
});

describe('UserService', () => {
	it('assign', async () => {
		if (user.hashedPassword)
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
});
