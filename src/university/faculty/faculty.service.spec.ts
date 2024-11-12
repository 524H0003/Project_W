import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { Faculty } from './faculty.entity';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let appSvc: AppService, faculty: Faculty;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {});

describe('FacultyService', () => {
	it('assign', async () => {
		let signature: string;

		faculty = Faculty.test(fileName);

		await appSvc.hook.assign(
			(20).string,
			(s: string) => {
				signature = s;
			},
			'_Email',
		);

		await execute(
			() =>
				appSvc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
						signature,
					},
					null,
				),
			{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
		);
	});

	it('assign failed due to email already taken', async () => {
		let signature: string;

		faculty = Faculty.test(fileName);

		await appSvc.baseUser.assign({ ...faculty.eventCreator.user.baseUser });
		await appSvc.hook.assign(
			(20).string,
			(s: string) => {
				signature = s;
			},
			'_Email',
		);

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				appSvc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
						signature,
					},
					null,
				),
			{
				throwError: true,
				exps: [{ type: 'toThrow', params: ['Invalid_Email'] }],
			},
		);
	});
});
