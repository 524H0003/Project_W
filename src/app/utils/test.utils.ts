import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { DocumentNode, print } from 'graphql';
import { HttpAdapterHost } from '@nestjs/core';
import { AppExceptionFilter } from 'app/app.filter';
import { expect } from '@jest/globals';
import Fastify, { LightMyRequestChain } from 'fastify';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyOptions, registerServerPlugins } from './server.utils';
import { TestModule } from 'app/module/test.module';
import { OutgoingHttpHeaders } from 'http';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

/**
 * Exported variables
 */
let requester: {
		(testCore: 'fastify'): LightMyRequestChain;
		(testCore: 'supertest'): TestAgent;
		(): LightMyRequestChain;
	},
	app: NestFastifyApplication;

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
	func: (...args: any[]) => Promise<R> | R,
	options: {
		numOfRun?: number;
		exps: Expectation<typeof func, K>[];
		onFinish?: (result: R) => void | Promise<void>;
	},
) {
	const { numOfRun = 1, exps, onFinish = null } = options,
		executed = func(),
		l1 = expect(
			executed instanceof Promise ? executed : (async () => await executed)(),
		);

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
		headers,
		map,
		attach,
	}?: {
		headers?: OutgoingHttpHeaders;
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

	return async (variables: K, { headers, map, attach } = {}): Promise<T> => {
		const l0 = requester('supertest')
				.post('/graphql')
				.set('Content-Type', 'multipart/form-data')
				.set({ 'apollo-require-preflight': 'true' }),
			l1 = headers['set-cookie']
				? l0.set('Cookie', headers['set-cookie'] as string[])
				: l0,
			l2 = l1
				.field('operations', JSON.stringify({ query, variables }))
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
export async function initJest() {
	const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AppModule],
		}).compile(),
		appSvc = module.get(AppService),
		fastify = Fastify(fastifyOptions);

	// eslint-disable-next-line tsEslint/no-unused-vars
	console.error = (...args: any) => true;

	await registerServerPlugins(fastify, {});
	app = module.createNestApplication(new FastifyAdapter(fastify));
	const { httpAdapter } = app.get(HttpAdapterHost);

	await app.useGlobalFilters(new AppExceptionFilter(httpAdapter)).init();
	await app.getHttpAdapter().getInstance().ready();

	function requesterFunc(testCore: 'fastify'): LightMyRequestChain;
	function requesterFunc(testCore: 'supertest'): TestAgent;
	function requesterFunc(): LightMyRequestChain;
	function requesterFunc(testCore: 'fastify' | 'supertest' = 'fastify') {
		return testCore == 'fastify'
			? app.inject()
			: supertest(app.getHttpServer());
	}

	requester = requesterFunc;

	return {
		module,
		appSvc,
		requester,
	};
}
