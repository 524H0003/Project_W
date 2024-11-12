import { IEventEntity } from 'event/event.model';

// Interfaces
/**
 * Tag model
 */
export interface ITag {
	/**
	 * Tag's name
	 */
	name: string;

	/**
	 * Tag to event
	 */
	toEvents: IEventEntity[];
}
