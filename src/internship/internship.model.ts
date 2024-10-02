import { IEnterprise } from 'enterprise/enterprise.model';
import { IStudent } from 'student/student.model';
import { IRecordTime } from 'utils/model.utils';

// Interfaces
export interface IInternship {
	trainee: IStudent;
	enterprise: IEnterprise;
	enterpriseAccepted: boolean;
	traineeAccepted: boolean;
	interviewAt: Date;
	interviewLongitude: number;
	interviewLatitude: number;
	TraineeStatus: TraineeStatus;
}

// Enums
export enum TraineeStatus {
	ONGOING = 'ONGOING',
	FINISHED = 'FINISHED',
	UNFINISHED = 'UNFINISHED',
	PENDING = 'PENDING',
}
