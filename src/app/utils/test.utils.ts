import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import { DocumentNode, print } from 'graphql';
import TestAgent from 'supertest/lib/agent';
import request from 'supertest';

/**
 * Exported variables
 */
let requester: TestAgent, app: INestApplication;

/**
 * Test's expectations
 */
interface Expectation<T, K extends keyof jest.Matchers<T>> {
	/**
	 * Expectation's type
	 */
	type: K;

	/**
	 * Expectation's param
	 */
	params: Parameters<jest.Matchers<T>[K]>;

	/**
	 * Is not?
	 */
	not?: boolean;

	/**
	 * Is debugging?
	 */
	debug?: boolean;
}

/**
 * A function run async functions and catch both throw errors and results
 * @param {T} func - the function to test
 * @param {object} options - the options to execute
 */
export async function execute<
	R,
	K extends keyof jest.Matchers<(...args: any[]) => Promise<R>>,
>(
	func: (...args: any[]) => Promise<R>,
	options: {
		throwError?: boolean;
		numOfRun?: number;
		exps: Expectation<typeof func, K>[];
		onFinish?: (result: R) => void;
	},
) {
	let funcResult: R;
	const { throwError = false, numOfRun = 1, exps, onFinish = null } = options;

	if (!throwError && numOfRun - 1) await numOfRun.ra(func);

	const result = throwError
		? expect(await func()).rejects
		: expect((funcResult = await func()));
	if (exps.some((i) => i.debug)) console.log(funcResult);
	for (const exp of exps) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-expect-error
		await (exp.not ? result.not : result)[exp.type].apply(null, exp.params);
	}
	if (onFinish) await onFinish(funcResult);
}

/**
 * Check if response has correct status code
 * @param {number} code - status code
 * @return {string}
 */
export function status(code: number): string {
	return ',"status":' + code.toString();
}

/**
 * sendGQL ouptut type
 */
export type SendGQLType<T, K> = (variables: K, cookie?: any) => Promise<T>;

/**
 * GraphQL query runner
 * @param {DocumentNode} astQuery - the graphql query
 * @return {T}
 */
export function sendGQL<T, K>(astQuery: DocumentNode): SendGQLType<T, K> {
	const query = print(astQuery);

	return async (variables: K, cookie?: any): Promise<T> => {
		const result = await requester
			.post('/graphql')
			.set('Cookie', cookie)
			.set('Content-Type', 'application/json')
			.send(JSON.stringify({ query, variables }));
		if (result.body.data) return result.body.data;
		throw new Error(result.body.errors[0].message);
	};
}

/**
 * Init jest test
 */
export async function initJest() {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
	}).compile();

	const appSvc = module.get(AppService);
	app = module.createNestApplication();

	await app.use(cookieParser()).init();
	requester = request(app.getHttpServer());

	return { module, appSvc, requester };
}

/**
 * Disable test function
 */
export function disableDescribe(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	name: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	func: () => void | Promise<void>,
) {}
