import { IEvent } from 'event/event.model';
import { IFaculty } from 'faculty/faculty.model';
import { IInternship } from 'internship/internship.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IStudent extends IUser {
	code: string;
	class: string;
	yearOfStudy: number;

	faculty: IFaculty;
	internships: IInternship[];
	careEvents: IEvent[];
}
