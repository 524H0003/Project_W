import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { UserRecieve } from 'user/user.entity';

const fileName = curFile(__filename);

let appSvc: AppService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

describe('HookService', () => {
	it('assign', async () => {
		await execute(
			() => appSvc.hook.assign(fileName + '_' + (5).string, () => {}, '_Email'),
			{
				exps: [{ type: 'toBeInstanceOf', params: [UserRecieve] }],
			},
		);
	});
});
