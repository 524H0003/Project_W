import { IUserInfo, IUserRecieve } from './user.model';

/**
 * User recieve infomations
 */
export class UserRecieve implements IUserRecieve {
	/**
	 * Quick user recieve initiation
	 * @param {object} payload - User recieve infomations
	 */
	constructor(payload: IUserRecieve) {
		Object.assign(this, payload);
	}

	/**
	 * User access token
	 */
	accessToken: string;

	/**
	 * User refresh token
	 */
	refreshToken: string;

	/**
	 * User generic infomations
	 */
	info: IUserInfo;

	/**
	 * @ignore
	 */
	static get test() {
		return new UserRecieve({
			accessToken: (10).string,
			refreshToken: (10).string,
			info: {} as IUserInfo,
		});
	}
}
