import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { IResult, UAParser } from 'ua-parser-js';
import { Bloc } from './bloc.entity';

const fileName = curFile(__filename);

let svc: AppService, user: User, mtdt: IResult;

beforeEach(async () => {
	const { appSvc } = await initJest();

	const rawUser = User.test(fileName);

	(svc = appSvc),
		(mtdt = new UAParser(fileName + '_' + (20).string).getResult()),
		(user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null));
});

describe('assign', () => {
	let bloc: Bloc;

	it('success', async () => {
		await execute(() => svc.bloc.assign(user, { mtdt }), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
	});

	it('success chaining', async () => {
		bloc = await svc.bloc.assign(user, { mtdt });

		await execute(() => svc.bloc.assign(user, { prev: bloc.id }), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
	});
});

describe('removeSnake', () => {
	let root: Bloc, sub: Bloc;

	beforeEach(async () => {
		(root = await svc.bloc.assign(user, { mtdt })),
			(sub = await svc.bloc.assign(user, { prev: root.id }));
	});

	it('success', async () => {
		await execute(() => svc.bloc.removeSnake(sub.id), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: root.id, cache: false }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
		await execute(() => svc.bloc.findOne({ id: sub.id, cache: false }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
	});

	it('success when delete root', async () => {
		await execute(() => svc.bloc.removeSnake(root.id), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: root.id, cache: false }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
		await execute(() => svc.bloc.findOne({ id: sub.id, cache: false }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
	});
});
