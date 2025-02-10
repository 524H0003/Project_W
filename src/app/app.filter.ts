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

	catch(exception: Error, host: ArgumentsHost) {
		if ((host.getType() as ContextType | 'graphql') === 'graphql')
			return exception;

		const { message } = exception;

		switch (exception['statusCode'] || errorStatus(exception)) {
			case 403:
				if (message.includes('csrf')) {
					if (message.includes('secret'))
						exception = new ServerException(
							'Invalid',
							'CsrfCookie',
							'',
							exception,
						);
					else if (message.includes('token'))
						exception = new ServerException(
							'Invalid',
							'CsrfToken',
							'',
							exception,
						);
				}
				break;

			case 401:
				exception = new ServerException(
					'Unauthorized',
					'User',
					'Access',
					exception,
				);
				break;
		}

		if (typeof exception['terminalLogging'] == 'function')
			exception['terminalLogging']();

		super.catch(exception, host);
	}
}
