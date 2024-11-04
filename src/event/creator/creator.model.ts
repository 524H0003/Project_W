import { IEvent } from 'event/event.model';
import { IUserClass } from 'user/user.model';

// Interfaces
/**
 * Event creator model
 */
export interface IEventCreatorRelationship {
	/**
	 * User core
	 */
	user: IUserClass;

	/**
	 * Created events
	 */
	createdEvents: IEvent[];
}

/**
 * Event creator class
 */
export interface IEventCreatorEntity extends IEventCreatorRelationship {}
