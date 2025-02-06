import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Enterprise } from './enterprise.entity';

const fileName = curFile(__filename);

let svc: AppService, enterprise: Enterprise;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	enterprise = Enterprise.test(fileName);
});

describe('EnterpriseService', () => {
	it('assign', async () => {
		await execute(
			() =>
				svc.enterprise.assign({ ...enterprise, ...enterprise.baseUser }, null),
			{
				exps: [{ type: 'toBeInstanceOf', params: [Enterprise] }],
				onFinish: async (result: Enterprise) => {
					await execute(() => svc.enterprise.find(result), {
						exps: [{ type: 'toHaveLength', params: [1] }],
					});
				},
			},
		);
	});
});
