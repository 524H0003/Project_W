import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { IResult, UAParser } from 'ua-parser-js';
import { BlocService } from './bloc.service';
import { Bloc } from './bloc.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const fileName = curFile(__filename);

let svc: AppService,
	user: User,
	mtdt: IResult,
	bloc: BlocService,
	repo: Repository<Bloc>;

beforeEach(async () => {
	const { appSvc, module } = await initJest();

	const rawUser = User.test(fileName);

	(svc = appSvc),
		(repo = module.get(getRepositoryToken(Bloc, 'sqlite_db'))),
		(bloc = module.get(BlocService)),
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
			(rootId = (await svc.bloc.findRoot({ id: childId })).id);
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

describe('removeTree', () => {
	let childId: string, rootId: string;

	beforeEach(async () => {
		(childId = (await svc.bloc.getTokens(user, mtdt)).accessToken),
			(rootId = (await svc.bloc.findRoot({ id: childId })).id);
	});

	it('success', async () => {
		await execute(() => svc.bloc.removeTree(childId), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: childId }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
		await execute(() => svc.bloc.findOne({ id: rootId }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('success when root bloc deleted', async () => {
		await svc.bloc.removeBloc(rootId);

		await execute(() => svc.bloc.removeTree(childId), {
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
		await execute(() => svc.bloc.removeTree(null), {
			exps: [{ type: 'toThrow', params: [err('Invalid', 'ID', '')] }],
		});
	});
});

describe('randomRemoveTree', () => {
	let childBloc: Bloc, rootId: string;

	beforeEach(async () => {
		(childBloc = await svc.bloc.findOne({
			id: (await svc.bloc.getTokens(user, mtdt)).accessToken,
		})),
			(rootId = (await svc.bloc.findRoot({ id: childBloc.id })).id);
	});

	it('success', async () => {
		await svc.bloc.removeBloc(rootId);

		jest.spyOn(bloc, 'find').mockReturnValueOnce(Promise.resolve([childBloc]));

		await execute(() => svc.bloc.randomRemoveTree(), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: childBloc.id }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('success when bloc out of time usage', async () => {
		await repo.update({ id: childBloc.id }, { lastIssue: 0 });

		childBloc = await svc.bloc.findOne({ id: childBloc.id });

		jest.spyOn(bloc, 'find').mockReturnValueOnce(Promise.resolve([childBloc]));

		await execute(() => svc.bloc.randomRemoveTree(), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});

		await execute(() => svc.bloc.findOne({ id: childBloc.id }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
		await execute(() => svc.bloc.findOne({ id: rootId }), {
			exps: [{ type: 'toBeNull', params: [] }],
		});
	});

	it('success when there is no bloc', async () => {
		jest.spyOn(bloc, 'find').mockReturnValueOnce(Promise.resolve([]));

		await execute(() => svc.bloc.randomRemoveTree(), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
	});
});
