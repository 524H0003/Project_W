import { IEventCreatorEntity } from 'event/creator/creator.model';

// Interfaces
/**
 * Faculty model
 */
export interface IFaculty {
	/**
	 * @ignore
	 */
	user: IEventCreatorEntity;

	/**
	 * Department name
	 */
	department: string;
}
