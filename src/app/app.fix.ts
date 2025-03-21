import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

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
