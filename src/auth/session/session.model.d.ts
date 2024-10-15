import { IDevice } from 'auth/device/device.model';
/**
 * Session model
 */
export interface ISession {
    /**
     * Session from device
     */
    device: IDevice;
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
