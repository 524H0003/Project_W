import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Interfaces
/**
 * Time record model
 */
interface IRecordTime {
	/**
	 * Create data record
	 */
	createdAt: Date;
	/**
	 * Update date record
	 */
	updatedAt: Date;
}

/**
 * Only required one of specified keys and remove remains
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = {
	[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

/**
 * Only required one of specified keys and require remains
 */
export type RequireOnlyOneRequiredRest<T, Keys extends keyof T = keyof T> = {
	[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys] &
	Required<Omit<T, Keys>>;

/**
 * Only required one of specified keys and optional remains
 */
export type RequireOnlyOneOptionalRest<T, Keys extends keyof T = keyof T> = {
	[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys] &
	Partial<Omit<T, Keys>>;

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
