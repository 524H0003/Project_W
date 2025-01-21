import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { FileType, IFile } from './file.model';
import { Event } from 'event/event.entity';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * File entity
 */
@ObjectType()
@Entity({ name: 'Document' })
export class File extends SensitiveInfomations implements IFile {
	/**
	 * Create file with infomations
	 * @param {IFile} payload - file's infomations
	 */
	constructor(payload: IFile) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	/**
	 * File creator
	 */
	@ManyToOne(() => User, (_: User) => _.uploadFiles)
	@JoinColumn({ name: 'user_id' })
	fileCreatedBy: User;

	/**
	 * File create for event
	 */
	@ManyToOne(() => Event, (_: Event) => _.documents, { nullable: true })
	@JoinColumn({ name: 'event_id' })
	atEvent: Event;

	// Infomations
	/**
	 * File's path
	 */
	@Field() @Column({ name: 'file_path', type: 'text' }) path: string;

	/**
	 * File's title
	 */
	@Field()
	@Column({ name: 'title', type: 'text', default: 'user_file' })
	title: string;

	/**
	 * File's type
	 */
	@Field(() => FileType)
	@Column({
		name: 'document_type',
		type: 'enum',
		enum: FileType,
		enumName: 'document_type',
		default: FileType.other,
	})
	type: FileType;

	/**
	 * File's upload time
	 */
	@Field()
	@Column({
		name: 'uploaded_at',
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
	})
	uploadedAt: Date;
}
