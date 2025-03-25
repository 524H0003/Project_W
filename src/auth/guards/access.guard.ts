import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { matching } from 'app/utils/utils';
import { Allow, AllowPublic, convertForGql, Forbid } from '.';

/**
 * Access token guard class
 */
@Injectable()
export class AccessGuard extends AuthGuard('access') {
	/**
	 * Initiate access token guard
	 */
	constructor(private reflector: Reflector) {
		super({ property: 'key' });
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

		const { role } = this.getRequest(context).key.user;

		if (allow.some((i) => matching(i, forbid)))
			throw new ServerException('Fatal', 'Method', 'Implementation');
		else if (!allow.length && !forbid.length) return true;

		return (
			(allow.length ? matching(role, allow) : true) && !matching(role, forbid)
		);
	}
}
