import { IEvent } from 'event/event.model';
import { IUserClass } from 'user/user.model';

// Interfaces
/**
 * Event creator model
 */
export interface IEventCreator {
	/**
	 * User core
	 */
	user: IUserClass;

	/**
	 * Created events
	 */
	createdEvents: IEvent[];
}
