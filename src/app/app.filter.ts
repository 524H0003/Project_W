import {
	ArgumentsHost,
	Catch,
	ContextType,
	HttpException,
	HttpServer,
	HttpStatus,
} from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

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
		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		switch (httpStatus) {
			case 401:
				exception = new ServerException('Unauthorized', 'User', 'Access');
				break;

			default:
				break;
		}

		if ((host.getType() as ContextType | 'graphql') === 'graphql')
			return exception;
		super.catch(exception, host);
	}
}
