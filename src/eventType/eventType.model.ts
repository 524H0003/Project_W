import { IEvent } from 'event/event.model';
import { IRecordTime } from 'utils/model.utils';

export interface IEventType {
	name: string;
	events: IEvent[];
}
