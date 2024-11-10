import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let appSvc: AppService, user: User;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	user = User.test(fileName);
});

describe('AuthService', () => {
	it('signUp', async () => {
		await execute(
			() => appSvc.auth.signUp({ ...user, ...user.baseUser }, null),
			{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
		);
	});
});
