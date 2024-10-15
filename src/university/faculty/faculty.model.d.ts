import { IEventCreator } from 'event/creator/creator.model';
/**
 * Faculty model
 */
export interface IFaculty {
    /**
     * @ignore
     */
    user: IEventCreator;
    /**
     * Department name
     */
    department: string;
}
