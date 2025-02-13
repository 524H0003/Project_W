import {
	createParamDecorator,
	ExecutionContext,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { matching } from 'app/utils/utils';
import { FastifyRequest } from 'fastify';
import { UAParser } from 'ua-parser-js';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';

/**
 * * Convert context's request to graphql's request
 * @param {ExecutionContext} context - context's request
 * ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this
 */
function convertForGql(context: ExecutionContext) {
	const { req, request } = GqlExecutionContext.create(context).getContext();
	return req || request;
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
	MetaData = createParamDecorator(
		(data: unknown, context: ExecutionContext): string => {
			const { headers } = context.getArgByIndex(0),
				uap = UAParser(headers);

			return JSON.stringify({
				...uap.withClientHints(),
				...uap.withFeatureCheck(),
			});
		},
	);

/**
 * Access token guard class
 */
@Injectable()
export class AccessGuard extends AuthGuard('access') {
	/**
	 * Initiate access token guard
	 */
	constructor(private reflector: Reflector) {
		super({ property: 'user' });
	}

	/**
	 * Convert client's request to suitable server request format
	 * @param {ExecutionContext} ctx - client request's context
	 */
	getRequest(ctx: ExecutionContext) {
		return convertForGql(ctx);
	}

	/**
	 * Identify if user is allowed to access
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;

		await super.canActivate(context); // ! Must run to check passport

		const allow = this.reflector.get(Allow, context.getHandler()) || [],
			forbid = this.reflector.get(Forbid, context.getHandler()) || [];

		const { role } = this.getRequest(context).user as User;

		if (allow.some((i) => matching(i, forbid)))
			throw new ServerException('Fatal', 'Method', 'Implementation');
		else if (!allow.length && !forbid.length) return true;

		return (
			(allow.length ? matching(role, allow) : true) && !matching(role, forbid)
		);
	}
}
