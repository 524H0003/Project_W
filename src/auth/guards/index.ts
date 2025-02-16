import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';
import { UAParser } from 'ua-parser-js';
import { IResult } from 'ua-parser-js';
import { UserRole } from 'user/user.model';

/**
 * * Convert context's request to graphql's request
 * @param {ExecutionContext} context - context's request
 * ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this
 */
export function convertForGql(context: ExecutionContext) {
	const { req, request } = GqlExecutionContext.create(context).getContext();
	return req || request;
}

/**
 * Global metadata type
 */
export type MetaData = IResult;

/**
 * Refresh request interface
 */
export interface IRefreshResult {
	/**
	 * Bloc hash
	 */
	blocHash: string;

	/**
	 * Bloc id
	 */
	blocId: string;

	/**
	 * Root id
	 */
	rootId: string;

	/**
	 * Root meta data
	 */
	metaData: MetaData;
}

/**
 * @ignore
 * Decorators
 * ! WARNING: it's must be (data: unknown, context: ExecutionContext) => {}
 * ! to void error [ExceptionsHandler] Cannot read properties of undefined (reading 'getType').
 */
export const Allow = Reflector.createDecorator<UserRole[]>(),
	Forbid = Reflector.createDecorator<UserRole[]>(),
	AllowPublic = Reflector.createDecorator<boolean>(),
	GetRequest = createParamDecorator(
		<K extends keyof FastifyRequest>(args: K, context: ExecutionContext) =>
			convertForGql(context)[args || 'user'],
	),
	GetMetaData = createParamDecorator(
		async (data: unknown, context: ExecutionContext): Promise<MetaData> => {
			const { headers } = context.getArgByIndex(0),
				uap = UAParser(headers);

			return {
				...(await uap.withClientHints()),
				...(await uap.withFeatureCheck()),
			};
		},
	);

export * from './access.guard';
export * from './refresh.guard';
export * from './file.guard';
export * from './localhost.guard';
export * from './hook.guard';
