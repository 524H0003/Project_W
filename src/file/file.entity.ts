import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { FileType, IFile } from './file.model';
import { Event } from 'event/event.entity';

@Entity({ name: 'Document' })
export class File extends SensitiveInfomations implements IFile {
	constructor(payload: IFile) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.uploadFiles)
	@JoinColumn({ name: 'user_id' })
	createdBy: User;

	@ManyToOne(() => Event, (_: Event) => _.documents)
	@JoinColumn({ name: 'event_id' })
	atEvent: Event;

	// Infomations
	@Column({ name: 'file_path', type: 'text' })
	path: string;

	@Column({ name: 'title', type: 'text' })
	title: string;

	@Column({
		name: 'document_type',
		type: 'enum',
		enum: FileType,
		enumName: 'document_type',
	})
	type: FileType;

	@Column({ name: 'uploaded_at', type: 'timestamp with time zone' })
	uploadedAt: Date;
}
