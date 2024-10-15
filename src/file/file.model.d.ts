import { IEvent } from 'event/event.model';
import { IUser } from 'user/user.model';
/**
 * File model
 */
export interface IFile {
    /**
     * File creator
     */
    createdBy: IUser;
    /**
     * File create for event
     */
    atEvent: IEvent;
    /**
     * File's title
     */
    title: string;
    /**
     * File's path
     */
    path: string;
    /**
     * File's type
     */
    type: FileType;
    /**
     * File's upload time
     */
    uploadedAt: Date;
}
export declare enum FileType {
    resume = "resume",
    report = "report",
    certificate = "certificate",
    other = "other"
}
