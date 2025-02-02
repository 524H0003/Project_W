import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Hook guard class
 */
@Injectable()
export class HookGuard extends AuthGuard('hook') {
	/**
	 * Initiate hook guard
	 */
	constructor() {
		super({ property: 'hook' });
	}
}
