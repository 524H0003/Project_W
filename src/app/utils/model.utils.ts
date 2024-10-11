import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Interfaces
interface IRecordTime {
	createdAt: Date;
	updatedAt: Date;
}

/**
 * The time record properties
 */
export class BlackBox implements IRecordTime {
	@CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
	updatedAt: Date;
}
