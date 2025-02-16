import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Bloc } from './bloc.entity';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let svc: AppService, bloc: Bloc, user: User;

beforeEach(async () => {
	const { appSvc } = await initJest();

	const rawUser = User.test(fileName);

	(svc = appSvc),
		(bloc = Bloc.test(fileName)),
		(user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null));
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => svc.bloc.assign(user, null), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});

it('remove', async () => {
	bloc = await svc.bloc.assign(user, null);

	await execute(() => svc.bloc.remove(bloc.id), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => svc.bloc.findOne({ id: bloc.id }), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});
