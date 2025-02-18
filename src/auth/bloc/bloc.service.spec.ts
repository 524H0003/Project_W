import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { IResult, UAParser } from 'ua-parser-js';

const fileName = curFile(__filename);

let svc: AppService, user: User, mtdt: IResult;

beforeEach(async () => {
	const { appSvc } = await initJest();

	const rawUser = User.test(fileName);

	(svc = appSvc),
		(mtdt = new UAParser(fileName + '_' + (20).string).getResult()),
		(user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null));
});

describe('getTokens', () => {
	it('success', async () => {
		await execute(() => svc.bloc.getTokens(user, mtdt), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});

it('remove', async () => {
	const id = (await svc.bloc.getTokens(user, mtdt)).accessToken;

	await execute(() => svc.bloc.remove(id), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => svc.bloc.findOne({ id }), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});
