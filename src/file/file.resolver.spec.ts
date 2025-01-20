import { AppService } from 'app/app.service';
import { initJest } from 'app/utils/test.utils';
import TestAgent from 'supertest/lib/agent';

const fileName = curFile(__filename);

let req: TestAgent, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

describe('uploadFile', () => {
	
});
