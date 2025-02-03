import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * File guard class
 */
@Injectable()
export class FileGuard extends AuthGuard('access') {
	/**
	 * Initiate file guard
	 */
	constructor() {
		super({ property: 'user' });
	}

	/**
	 * Always allow access to file endpoints
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			await super.canActivate(context);
		} catch (error) {
			console.log(error);
		}
		return true;
	}
}
