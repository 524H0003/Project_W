import { IDeviceEntity } from 'auth/device/device.model';

// Interfaces
/**
 * Session model
 */
export interface ISession {
	/**
	 * Session from device
	 */
	device: IDeviceEntity;

	/**
	 * Session's use time left
	 */
	useTimeLeft: number;

	/**
	 * Session's child
	 */
	child: string;

	/**
	 * Session's parrent
	 */
	parrent: string;
}
