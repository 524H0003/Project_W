import { IEvent } from 'event/event.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Event creator model
 */
export interface IEventCreatorRelationship {
	/**
	 * User core
	 */
	user: IUserEntity;

	/**
	 * Created events
	 */
	createdEvents: IEvent[];
}

/**
 * Event creator class
 */
export interface IEventCreatorEntity extends IEventCreatorRelationship {}
