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
 * Time record entity
 */
export declare class BlackBox implements IRecordTime {
    /**
     * Create date record
     */
    createdAt: Date;
    /**
     * Update date record
     */
    updatedAt: Date;
}
export {};
