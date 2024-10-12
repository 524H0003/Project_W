import { IEventCreator } from 'event/creator/creator.model';

// Interfaces
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
