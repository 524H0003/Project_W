import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CustomScalar, GqlExecutionContext, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';

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
