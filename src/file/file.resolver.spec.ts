import { execute, initJest, sendGQL, SendGQLType } from 'app/utils/test.utils';
import {
	UploadFile,
	UploadFileMutation,
	UploadFileMutationVariables,
} from 'build/compiled_graphql';
import TestAgent from 'supertest/lib/agent';

const fileName = curFile(__filename);

let req: TestAgent;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

describe('uploadFile', () => {
	let send: SendGQLType<UploadFileMutation, UploadFileMutationVariables>;

	beforeEach(() => {
		send = sendGQL<UploadFileMutation, UploadFileMutationVariables>(
			UploadFile,
			req
				.post('/graphql')
				.set('Content-Type', 'multipart/form-data')
				.field('map', JSON.stringify({ image: ['variables.file'] }))
				.attach(
					'image',
					Buffer.from((40).string, 'base64'),
					fileName + (6).string + '.png',
				),
		);
	});

	it('success', async () => {
		await execute(async () => (await send({ file: null })).uploadFile, {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});
