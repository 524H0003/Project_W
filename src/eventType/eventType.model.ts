import { IEvent } from 'event/event.model';

export interface IEventType {
	name: string;
	events: IEvent[];
}
