import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import { DocumentNode, print } from 'graphql';
import TestAgent from 'supertest/lib/agent';
import request from 'supertest';
import { HttpAdapterHost } from '@nestjs/core';
import { AppExceptionFilter } from 'app/app.filter';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import supertest from 'supertest';

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
		numOfRun?: number;
		exps: Expectation<typeof func, K>[];
		onFinish?: (result: R) => void | Promise<void>;
	},
) {
	const { numOfRun = 1, exps, onFinish = null } = options,
		executed: Promise<R> = func(),
		l1 = expect(executed);

	if (numOfRun - 1) await numOfRun.ra(func);
	if (!exps.length)
		throw new ServerException('Fatal', 'Method', 'Implementation', 'server');

	for (const exp of exps) {
		const l2 =
			exp.type === 'toThrow'
				? exp.not
					? l1.resolves
					: l1.rejects
				: l1.resolves;
		//@ts-expect-error
		await (exp.not ? l2.not : l2)[exp.type].apply(null, exp.params);
	}

	if (onFinish) await onFinish(await executed);
}

/**
 * sendGQL ouptut type
 */
export type SendGQLType<T, K> = (
	variables: K,
	{
		cookie,
		map,
		attach,
	}?: {
		cookie?: any;
		map?: object;
		attach?: Parameters<supertest.Test['attach']>;
	},
) => Promise<T>;

/**
 * GraphQL query runner
 * @param {DocumentNode} astQuery - the graphql query
 * @return {T}
 */
export function sendGQL<T, K>(astQuery: DocumentNode): SendGQLType<T, K> {
	const query = print(astQuery);

	return async (variables: K, { cookie, map, attach } = {}): Promise<T> => {
		const l0 = requester
				.post('/graphql')
				.set('Content-Type', 'multipart/form-data')
				.set({ 'apollo-require-preflight': 'true' }),
			l1 = cookie ? l0.set('Cookie', cookie) : l0,
			l2 = l1
				.field(
					'operations',
					JSON.stringify({
						query,
						variables,
					}),
				)
				.field('map', JSON.stringify(map) || '{}'),
			l3 = attach ? l2.attach(...attach) : l2,
			result = await l3;
		if (result.body.data) return result.body.data;
		throw new Error(result.body.errors[0].message);
	};
}

/**
 * Init jest test
 */
export async function initJest(
	controllers: Array<any> = [],
	providers: Array<any> = [],
) {
	const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AppModule],
			controllers,
			providers,
		}).compile(),
		appSvc = module.get(AppService);

	// eslint-disable-next-line tsPlugin/no-unused-vars
	console.error = (...args: any) => true;

	app = module.createNestApplication();
	const { httpAdapter } = app.get(HttpAdapterHost);
	await app
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.use(cookieParser())
		.use('/graphql', graphqlUploadExpress({ maxFileSize: (50).mb2b }))
		.init();
	requester = request(app.getHttpServer());

	return { module, appSvc, requester };
}
