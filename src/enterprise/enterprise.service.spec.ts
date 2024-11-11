import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { Enterprise } from './enterprise.entity';

const fileName = curFile(__filename);

let appSvc: AppService, enterprise: Enterprise, signature: string;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	enterprise = Enterprise.test(fileName);
});

describe('EnterpriseService', () => {
	it('assign', async () => {
		await appSvc.hook.assign(
			(20).string,
			(s: string) => {
				signature = s;
			},
			'_Email',
		);

		await execute(
			() =>
				appSvc.enterprise.assign(
					{ ...enterprise, ...enterprise.baseUser, signature },
					null,
				),
			{
				exps: [{ type: 'toBeInstanceOf', params: [Enterprise] }],
				onFinish: async (result: Enterprise) => {
					await execute(() => appSvc.enterprise.find(result), {
						exps: [{ type: 'toHaveLength', params: [1] }],
					});
				},
			},
		);
	});
});
