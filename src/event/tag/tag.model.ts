import { IEntityId } from 'app/typeorm/typeorm.model';
import { IEventEntity } from 'event/event.model';

// Interfaces
/**
 * Tag relationships
 */
export interface ITagRelationships {
	/**
	 * Tag to event
	 */
	toEvents?: IEventEntity[];
}

/**
 * Tag model
 */
export interface ITagInfo extends IEntityId {
	/**
	 * Tag's name
	 */
	name: string;
}

/**
 * Tag entity
 */
export interface ITagEntity extends ITagInfo, ITagRelationships {}
