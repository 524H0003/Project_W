import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';

@Injectable()
export class LocalHostStrategy implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const req = context.switchToHttp().getRequest(),
			isLocalhost =
				req.hostname === 'localhost' || req.hostname === '127.0.0.1';
		if (!isLocalhost)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		else return true;
	}
}
