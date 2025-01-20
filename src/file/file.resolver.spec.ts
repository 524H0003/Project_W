import { AppService } from 'app/app.service';
import { execute, initJest, sendGQL } from 'app/utils/test.utils';
import {
	UploadFile,
	UploadFileMutation,
	UploadFileMutationVariables,
} from 'build/compiled_graphql';
import TestAgent from 'supertest/lib/agent';

const fileName = curFile(__filename);

let req: TestAgent, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

describe('uploadFile', () => {
	const send = sendGQL<UploadFileMutation, UploadFileMutationVariables>(
		UploadFile,
		req.post('/graphql'),
	);

	it('success', async () => {
		await execute(async () => await send({ file: '$file' }));
	});
});
