import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Refresh token guard class
 */
@Injectable()
export class RefreshGuard extends AuthGuard('refresh') {
	/**
	 * Initiate refresh token guard
	 */
	constructor() {
		super({ property: 'refresh' });
	}
}
