import { IEvent } from 'event/event.model';
import { IUser } from 'user/user.model';

// Interfaces
/**
 * Event creator model
 */
export interface IEventCreator {
	/**
	 * User core
	 */
	user: IUser;

	/**
	 * Created events
	 */
	createdEvents: IEvent[];
}
