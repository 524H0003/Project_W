import { IDevice } from 'device/device.model';

// Interfaces
export interface ISession {
	device: IDevice;
	useTimeLeft: number;
	child: string;
	parrent: string;
}
