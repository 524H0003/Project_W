import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CustomScalar, GqlExecutionContext, Scalar } from '@nestjs/graphql';
import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { dataHashing } from './utils/auth.utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { Kind } from 'graphql';
import { InterfaceCasting } from './utils/utils';

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
	private isCacheGQL: boolean = false;

	protected isRequestCacheable(context: ExecutionContext): boolean {
		let req: FastifyRequest;

		if (context.getType() == 'http') req = context.switchToHttp().getRequest();
		else
			req = GqlExecutionContext.create(context).getContext<{
				req: FastifyRequest;
			}>().req;

		return (
			this.allowedMethods.includes(req?.method) ||
			(this.isCacheGQL && ['/graphql'].some((i) => i == req?.url.toLowerCase()))
		);
	}

	protected trackBy(context: ExecutionContext): string | undefined {
		const httpAdapter = this.httpAdapterHost.httpAdapter,
			isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod,
			cacheMetadata = this.reflector.get(
				CACHE_KEY_METADATA,
				context.getHandler(),
			),
			getQuery = (query: string, variables: object) => {
				const f = query.indexOf('('),
					s = query.indexOf('{'),
					getVariable = () => {
						const j = query.indexOf(')'),
							input = query.substring(f + 1, j);

						return InterfaceCasting.quick(
							variables,
							input
								.replaceAll(' ', '')
								.split(',')
								.map((i) => i.split(':')[0].substring(1)) as any,
						);
					};

				if (f == -1 && s == -1) return;

				return {
					q: query
						.slice(f != -1 ? f : s)
						.replaceAll(/\n/g, ' ')
						.replaceAll(/\r/g, ' ')
						.replace(/\ \ /g, '')
						.replace(/\ \ /g, ''),
					v: f != -1 ? getVariable() : '',
				};
			};

		if (!isHttpApp || cacheMetadata) return cacheMetadata;

		if (!this.isRequestCacheable(context)) return undefined;

		let req: FastifyRequest;

		if (context.getType() == 'http') req = context.switchToHttp().getRequest();
		else
			req = GqlExecutionContext.create(context).getContext<{
				req: FastifyRequest;
			}>().req;

		if (req.method.toLowerCase() == 'get') return req.url;

		if (req.url.toLowerCase() == '/graphql')
			return dataHashing(
				JSON.stringify({
					userId: req.user.id,
					...getQuery(req.body['query'] || '', req.body['variables'] || ''),
				}),
			);

		return undefined;
	}

	protected setHeadersWhenHttp(context: ExecutionContext, value: any): void {
		if (!this.httpAdapterHost) return;

		const { httpAdapter } = this.httpAdapterHost;

		if (!httpAdapter) return;

		let response: FastifyReply;
		if (context.getType() == 'http')
			response = context.switchToHttp().getResponse();
		else
			response = GqlExecutionContext.create(context).getContext<{
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
