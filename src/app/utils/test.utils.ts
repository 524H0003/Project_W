import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { DocumentNode, print } from 'graphql';
import { HttpAdapterHost } from '@nestjs/core';
import { AppExceptionFilter } from 'app/app.filter';
import { expect } from '@jest/globals';
import Fastify, {
	InjectOptions,
	LightMyRequestChain,
	LightMyRequestResponse,
} from 'fastify';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyOptions, registerServerPlugins } from './server.utils';
import { TestModule } from 'app/module/test.module';
import { OutgoingHttpHeaders } from 'http';
import formAutoContent from 'form-auto-content';
import {
	createReadStream,
	existsSync,
	mkdirSync,
	ReadStream,
	writeFileSync,
} from 'fs';
import { isAsyncFunction } from 'util/types';

/**
 * requester type
 */
export type RequesterType = {
	(): LightMyRequestChain;
	(opt?: InjectOptions): Promise<LightMyRequestResponse>;
};

/**
 * Exported variables
 */
let requester: RequesterType, app: NestFastifyApplication;

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
 * Execute options
 */
type ExecuteOptions<
	K extends keyof jest.Matchers<(...args: any[]) => Promise<R>>,
	R,
	F,
> = {
	numOfRun?: number;
	exps: Expectation<F, K>[];
	onFinish?: (result: R) => void | Promise<void>;
	handleLoop?: (func: F) => void | Promise<void>;
};

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
	{
		numOfRun = 1,
		exps,
		onFinish = null,
		handleLoop = null,
	}: ExecuteOptions<K, R, typeof func>,
) {
	if (!exps.length)
		throw new ServerException('Fatal', 'Method', 'Implementation');

	if (isAsyncFunction(func) && numOfRun - 1 > 0 && handleLoop)
		await numOfRun.range(() => handleLoop(func));

	const executed = func(),
		l1 = expect(
			executed instanceof Promise ? executed : (async () => await executed)(),
		);

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
		files,
	}?: {
		headers?: OutgoingHttpHeaders;
		map?: object;
		files?: Record<string, ReadStream>;
	},
) => Promise<T>;

/**
 * Get headers cookie
 */
export function getCookie(headers: string | string[]) {
	return (Array.isArray(headers) ? headers : [headers])
		.filter(Boolean)
		.join(';');
}

/**
 * GraphQL query runner
 * @param {DocumentNode} astQuery - the graphql query
 * @return {T}
 */
export function sendGQL<T, K>(astQuery: DocumentNode): SendGQLType<T, K> {
	const query = print(astQuery);

	return async (
		variables: K,
		{ headers, map = {}, files = {} } = {},
	): Promise<T> => {
		const body = { query, variables },
			cookie = headers['set-cookie']
				? getCookie(headers['set-cookie'])
				: undefined,
			hasFile = Object.keys(files).length,
			{ payload, contentType } = formAutoContent(
				{
					...{ operations: JSON.stringify(body), map: JSON.stringify(map) },
					...files,
				},
				{ headers: 'contentType' },
			),
			l0 = hasFile
				? requester({
						method: 'post',
						url: '/graphql',
						payload,
						headers: {
							'content-type': contentType['content-type'],
							'apollo-require-preflight': 'true',
							cookie,
						},
					})
				: requester().post('/graphql').headers({ cookie }).body(body),
			{ data, errors } = (await l0).json();
		if (data) return data as T;
		throw new Error(errors[0].message);
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

	function requesterFunc(): LightMyRequestChain;
	function requesterFunc(opt: InjectOptions): Promise<LightMyRequestResponse>;
	function requesterFunc(opt?: InjectOptions) {
		return opt ? app.inject(opt) : app.inject();
	}

	requester = requesterFunc;

	return { module, appSvc, requester };
}

/**
 * Create file for testing
 * @param {string} name - name for file
 * @param {Buffer} content - file content in buffer
 * @return {ReadStream}
 */
export function createFile(name: string, content: Buffer): ReadStream {
	const dir = './dist/',
		path = dir + name;

	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	writeFileSync(path, content);

	return createReadStream(path);
}
