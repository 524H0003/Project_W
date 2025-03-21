import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CacheInterceptor } from '@nestjs/cache-manager';

export class ModifiedThrottlerGuard extends ThrottlerGuard {
	protected getRequestResponse(context: ExecutionContext): {
		req: Record<string, any>;
		res: Record<string, any>;
	} {
		if (context.getType() == 'http') return super.getRequestResponse(context);

		const { res, req } = GqlExecutionContext.create(context).getContext();

		return { req, res };
	}
}

export class ModifiedCacheInterceptor extends CacheInterceptor {
	protected isRequestCacheable(context: ExecutionContext): boolean {
		if (context.getType() == 'http') return super.isRequestCacheable(context);

		const { req } = GqlExecutionContext.create(context).getContext();

		return this.allowedMethods.includes(req.method);
	}
}
