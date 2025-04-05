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

describe('assign', () => {
	it('success', async () => {
		await execute(
			() =>
				svc.enterprise.assign({ ...enterprise, ...enterprise.baseUser }, null),
			{
				exps: [{ type: 'toBeInstanceOf', params: [Enterprise] }],
				onFinish: async ({ description }: Enterprise) => {
					await execute(
						() => svc.enterprise.findOne({ description, cache: false }),
						{ exps: [{ type: 'toBeDefined', params: [] }] },
					);
				},
			},
		);
	});
});

describe('modify', () => {
	it('success', async () => {
		const dbUser = await svc.enterprise.assign(
				{ ...enterprise, ...enterprise.baseUser },
				null,
			),
			name = (20).string,
			newEnterprise = { baseUser: { name }, industry: 'a' };

		await execute(() => svc.enterprise.modify(dbUser.id, newEnterprise), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(
					() => svc.enterprise.find({ ...newEnterprise, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
				await execute(() => svc.baseUser.find({ name, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});
