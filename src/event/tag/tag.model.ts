import { IEvent } from 'event/event.model';

// Interfaces
export interface ITag {
	name: string;

	toEvents: IEvent[];
}
