import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';

/**
 * Only allow connections from localhost
 */
@Injectable()
export class LocalHostStrategy implements CanActivate {
	/**
	 * Check the connection
	 * @param {ExecutionContext} context - request's context
	 */
	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest(),
			isLocalhost =
				req.hostname === 'localhost' || req.hostname === '127.0.0.1';
		if (!isLocalhost)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		else return true;
	}
}
