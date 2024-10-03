import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface IRecordTime {
	createdAt: Date;
	updatedAt: Date;
}

export class BlackBox implements IRecordTime {
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
