import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { IPaginateResult } from './graphql.model';

export function PaginateResult<T>(
	ItemType: Type<T>,
): abstract new (...args: any[]) => IPaginateResult<T> {
	@ObjectType({ isAbstract: true })
	abstract class PageClass implements IPaginateResult<T> {
		@Field(() => [ItemType]) items: T[];

		@Field() total: number;

		@Field() currentPage: number;

		@Field() totalPages: number;

		@Field() pageSize: number;

		@Field() hasNext: boolean;

		@Field() hasPrevious: boolean;
	}

	return PageClass;
}
