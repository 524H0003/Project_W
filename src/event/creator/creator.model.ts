import { IEntityId } from 'app/typeorm/typeorm.model';
import { IEventEntity } from 'event/event.model';
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
	createdEvents?: IEventEntity[];
}

/**
 * Event creator info
 */
export interface IEventCreatorInfo extends IEntityId {}

/**
 * Event creator class
 */
export interface IEventCreatorEntity
	extends IEventCreatorRelationship,
		IEventCreatorInfo {}
