import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { TestModule } from './module/test.module';
import { AppModule } from './app.module';
import { execute } from './utils/test.utils';
import { BaseUser } from './app.entity';

const fileName = curFile(__filename);

let appSvc: AppService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

describe('BaseUserService', () => {
	it('assign', async () => {
		const { name, email } = BaseUser.test(fileName);

		await execute(() => appSvc.baseUser.assign({ name, email }), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{ type: 'toMatchObject', params: [{ name, email: email.lower }] },
			],
		});
	});

	it('modify', async () => {
		const { name, email } = BaseUser.test(fileName),
			newName = (5).string + '_' + name,
			baseUser = await appSvc.baseUser.assign({ name, email });

		await execute(
			() => appSvc.baseUser.modify(baseUser.id, { email, name: newName }),
			{
				exps: [
					{ type: 'toBeInstanceOf', params: [BaseUser] },
					{
						type: 'toMatchObject',
						params: [{ email: email.lower, name: newName }],
					},
				],
			},
		);
		await execute(() => appSvc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('remove', async () => {
		const { name, email } = BaseUser.test(fileName),
			usr = await appSvc.baseUser.assign({ name, email });

		// eslint-disable-next-line @typescript-eslint/require-await
		await execute(async () => () => appSvc.baseUser.remove(usr.id), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
		await execute(() => appSvc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('email', async () => {
		const { name, email } = BaseUser.test(fileName);

		await appSvc.baseUser.assign({ name, email });

		await execute(() => appSvc.baseUser.email(email), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{ type: 'toMatchObject', params: [{ email: email.lower, name }] },
			],
		});
	});
});
