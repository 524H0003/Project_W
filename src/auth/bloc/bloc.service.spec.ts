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

describe('removeStrayTree', () => {
	let childId: string, rootId: string;

	beforeEach(async () => {
		(childId = (await svc.bloc.getTokens(user, mtdt)).accessToken),
			(rootId = (await svc.bloc.findRootById(childId)).id);
	});

	it('success', async () => {
		await svc.bloc.removeBloc(rootId);

		await execute(() => svc.bloc.removeStrayTree(childId), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: childId }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
		await execute(() => svc.bloc.findOne({ id: rootId }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('fail when root bloc not deleted', async () => {
		await execute(() => svc.bloc.removeStrayTree(childId), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: childId }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
		await execute(() => svc.bloc.findOne({ id: rootId }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});

	it('fail due to invalid id', async () => {
		await execute(() => svc.bloc.removeStrayTree(null), {
			exps: [{ type: 'toThrow', params: [err('Invalid', 'ID', '')] }],
		});
	});
});
