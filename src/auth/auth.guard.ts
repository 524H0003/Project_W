import {
	createParamDecorator,
	ExecutionContext,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { matching } from 'app/utils/utils';
import UAParser from 'ua-parser-js';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';

/**
 * * Convert context's request to graphql's request
 * @param {ExecutionContext} context - context's request
 * ! Cautious: Since using GraphQL, it's NOT recommend to DELETE this
 */
function convertForGql(context: ExecutionContext) {
	const ctx = GqlExecutionContext.create(context);
	return ctx.getContext().req;
}

/**
 * @ignore
 * Decorators
 * ! WARNING: it's must be (data: unknown, context: ExecutionContext) => {}
 * ! to void error [ExceptionsHandler] Cannot read properties of undefined (reading 'getType')
 */
export const Roles = Reflector.createDecorator<UserRole[]>(),
	AllowPublic = Reflector.createDecorator<boolean>(),
	CurrentUser = createParamDecorator(
		(data: unknown, context: ExecutionContext) => convertForGql(context).user,
	),
	CurrentUserId = createParamDecorator(
		(data: unknown, context: ExecutionContext) =>
			(convertForGql(context).user as User).baseUser.id,
	),
	MetaData = createParamDecorator(
		(data: unknown, context: ExecutionContext): string =>
			JSON.stringify(
				new UAParser()
					.setUA(convertForGql(context).headers['user-agent'])
					.getResult(),
			),
	);

/**
 * Role method guard
 */
@Injectable()
export class RoleGuard extends AuthGuard('access') {
	/**
	 * @ignore
	 */
	constructor(private reflector: Reflector) {
		super();
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
	 * @param {ExecutionContext} context - client request's context
	 * @return {Promise<boolean>} allow if user valid
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (this.reflector.get(AllowPublic, context.getHandler())) return true;
		await super.canActivate(context); // ! Must run to check passport
		const roles = this.reflector.get(Roles, context.getHandler());
		if (roles) {
			const req = this.getRequest(context),
				user = req.user as User;

			return matching(user.role, roles);
		}
		throw new InternalServerErrorException(
			'Function not defined roles/permissions',
		);
	}
}
