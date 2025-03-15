import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { FileType, IFileEntity } from './file.model';
import { Event } from 'event/event.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { IFileInfoKeys } from 'build/models';

/**
 * File entity
 */
@ObjectType()
@Entity({ name: 'Document' })
export class File extends GeneratedId implements IFileEntity {
	/**
	 * Create file with infomations
	 * @param {IFile} payload - file's infomations
	 */
	constructor(payload: NonFunctionProperties<IFileEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(this, IFileInfoKeys));
		this.fileCreatedBy = new User(payload.fileCreatedBy);
		this.atEvent = new Event(payload.atEvent);
	}

	// Relationships
	/**
	 * File creator
	 */
	@ManyToOne(() => User, (_: User) => _.uploadFiles, { nullable: true })
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
