import { IEvent } from 'event/event.model';

// Interfaces
/**
 * Event creator model
 */
export interface IEventCreator {
	/**
	 * Created events
	 */
	createdEvents: IEvent[];
}
