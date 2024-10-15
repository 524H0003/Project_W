import { IReciever } from './reciever/reciever.model';
/**
 * Notification model
 */
export interface INotification {
    /**
     * Notification title
     */
    title: string;
    /**
     * Notification content
     */
    content: string;
    /**
     * Notification type
     */
    type: NotificationType;
    /**
     * Notification send to
     */
    sent: IReciever[];
}
export declare enum NotificationType {
    event = "event",
    participation = "participator",
    progress = "progress",
    system = "system"
}
