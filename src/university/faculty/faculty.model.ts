import { IEventCreatorClass } from 'event/creator/creator.model';

// Interfaces
/**
 * Faculty model
 */
export interface IFaculty {
	/**
	 * @ignore
	 */
	user: IEventCreatorClass;

	/**
	 * Department name
	 */
	department: string;
}
