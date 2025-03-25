import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * File guard class
 */
@Injectable()
export class FileGuard extends AuthGuard('access') {
	/**
	 * Initiate file guard
	 */
	constructor() {
		super({ property: 'key' });
	}

	/**
	 * Always allow access to file endpoints
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			await super.canActivate(context);
		} catch (error) {
			switch ((error as Error).message) {
				case 'Unauthorized':
					break;

				default:
					throw error;
			}
		}
		return true;
	}
}
