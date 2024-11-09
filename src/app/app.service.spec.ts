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
		const email = (20).string + '@lmao.com',
			name = fileName + '_' + (5).string;

		await execute(() => appSvc.baseUser.assign({ name, email }), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{
					type: 'toMatchObject',
					params: [new BaseUser({ name, email: email.lower })],
				},
			],
		});
	});

	it('modify', async () => {
		const email = (20).string + '@lmao.com',
			name = fileName + '_' + (5).string,
			newName = (5).string + '_' + name;

		await appSvc.baseUser.assign({ name, email });

		await execute(
			() => appSvc.baseUser.modify({ email, name }, { email, name: newName }),
			{
				exps: [
					{ type: 'toBeInstanceOf', params: [BaseUser] },
					{
						type: 'toMatchObject',
						params: [new BaseUser({ email: email.lower, name: newName })],
					},
				],
			},
		);
		await execute(() => appSvc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('remove', async () => {
		const email = (20).string + '@lmao.com',
			name = fileName + '_' + (5).string;

		await appSvc.baseUser.assign({ name, email });

		await execute(() => appSvc.baseUser.remove({ name, email }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
		await execute(() => appSvc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('email', async () => {
		const email = (20).string + '@lmao.com',
			name = fileName + '_' + (5).string;

		await appSvc.baseUser.assign({ name, email });

		await execute(() => appSvc.baseUser.email(email), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{
					type: 'toMatchObject',
					params: [new BaseUser({ email: email.lower, name })],
				},
			],
		});
	});
});
