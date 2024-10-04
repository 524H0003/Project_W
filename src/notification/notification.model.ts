import { IReciever } from './reciever/reciever.model';

// Interfaces
export interface INotification {
	title: string;
	content: string;
	type: NotificationType;

	sent: IReciever[];
}

// Enums
export enum NotificationType {
	event = 'event',
	participation = 'participator',
	progress = 'progress',
	system = 'system',
}
