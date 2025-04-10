import { Paging } from 'app/app.graphql';
import { IPaginateResult } from './graphql.model';

export async function paginateResponse<T>(
	service: { readonly total: () => Promise<number> },
	items: T[],
	{ index, take }: Paging,
): Promise<IPaginateResult<T>> {
	const total = await service.total(),
		totalPages = total / take + 1;
	return {
		items,
		total,
		totalPages,
		currentPage: index,
		pageSize: take,
		hasNext: !(index < totalPages - 1),
		hasPrevious: index != 0,
	};
}
