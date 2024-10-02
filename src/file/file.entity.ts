import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { IFile } from './file.model';

@Entity()
export class File extends SensitiveInfomations implements IFile {
	constructor(payload: IFile) {
		super();
		Object.assign(this, payload);
	}

	@Column()
	path: string;

	@Column({ default: false })
	forEveryone: boolean;

	// Relationships
	@ManyToOne(() => User, (_) => _.uploadFiles)
	createdBy: User;
}
