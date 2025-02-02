import {
	CanActivate,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { IncomingMessage } from 'http';

/**
 * Only allow connections from localhost
 */
@Injectable()
export class LocalHostStrategy implements CanActivate {
	/**
	 * Check the connection
	 * @param {ExecutionContextHost} context - request's context
	 */
	canActivate(context: ExecutionContextHost): boolean {
		const req = context.switchToHttp().getRequest(),
			isLocalhost =
				req.hostname === 'localhost' || req.hostname === '127.0.0.1';
		if (!isLocalhost)
			throw new HttpException(
				`Cannot ${context.switchToHttp().getRequest<IncomingMessage>().method} ${context.switchToHttp().getRequest<IncomingMessage>().url}`,
				HttpStatus.NOT_FOUND,
			);
		else return true;
	}
}
