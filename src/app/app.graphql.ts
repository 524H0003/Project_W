import { Field, InputType } from '@nestjs/graphql';
import { IPaging } from './utils/model.utils';

@InputType()
export class Paging implements IPaging {
	@Field() index: number;
	@Field() take: number;
}
