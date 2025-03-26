import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CustomScalar, GqlExecutionContext, Scalar } from '@nestjs/graphql';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FastifyReply } from 'fastify';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { Kind } from 'graphql';
import { convertForGql } from 'auth/guards';

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
		return this.allowedMethods.includes(convertForGql(context).method);
	}

	protected setHeadersWhenHttp(context: ExecutionContext, value: any): void {
		if (!this.httpAdapterHost || !this.httpAdapterHost.httpAdapter) return;

		const { httpAdapter } = this.httpAdapterHost;

		const response = GqlExecutionContext.create(context).getContext<{
			res: FastifyReply;
		}>().res;

		httpAdapter.setHeader(response, 'X-Cache', isNil(value) ? 'MISS' : 'HIT');
	}
}

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
	description = 'DateTime custom scalar type';

	parseValue(value: unknown): Date {
		switch (true) {
			case value instanceof Date:
				return value;

			case typeof value == 'string':
				return new Date(value);

			default:
				return null;
		}
	}

	serialize(value: unknown): string {
		switch (true) {
			case value instanceof Date:
				return value.toISOString();

			default:
				return this.parseValue(value).toISOString();
		}
	}

	parseLiteral(ast: any): Date {
		if (ast.kind === Kind.STRING) {
			return new Date(ast.value);
		}
		return null;
	}
}
