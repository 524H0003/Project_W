import { IEvent } from 'event/event.model';
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
    toEvents: IEvent[];
}
