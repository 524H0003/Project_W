export interface IPaginateResult<T> {
	items: T[];
	total: number;
	currentPage: number;
	totalPages: number;
	pageSize: number;
	hasNext: boolean;
	hasPrevious: boolean;
}
