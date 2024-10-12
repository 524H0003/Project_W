import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Interfaces
/**
 * Time record model
 */
interface IRecordTime {
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Time record entity
 */
export class BlackBox implements IRecordTime {
	/**
	 * Create date record
	 */
	@CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
	createdAt: Date;

	/**
	 * Update date record
	 */
	@UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
	updatedAt: Date;
}
