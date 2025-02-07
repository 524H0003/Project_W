import { ArgumentsHost, Catch, ContextType, HttpServer } from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

/**
 * App exception filter class
 */
@Catch()
export class AppExceptionFilter extends BaseExceptionFilter {
	constructor(
		applicationRef:
			| HttpServer<any, any, any>
			| AbstractHttpAdapter<any, any, any>,
	) {
		super(applicationRef);
	}

	catch(exception: unknown, host: ArgumentsHost) {
		if ((host.getType() as ContextType | 'graphql') === 'graphql')
			return exception;

		switch (errorStatus(exception)) {
			case 401:
				exception = new ServerException('Unauthorized', 'User', 'Access');
				break;
		}
		super.catch(exception, host);
	}
}
