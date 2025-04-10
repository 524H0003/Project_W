import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ITagInfo } from './tag.model';
import { PaginateResult } from 'app/graphql/graphql.dto';
import { EventTag } from './tag.entity';

@InputType()
export class EventTagAssign implements ITagInfo {
	@Field() name: string;
}

@InputType()
export class EventTagAttach implements ITagInfo {
	@Field() name: string;
	@Field() eventId: string;
}

@InputType()
export class FindTag implements ITagInfo {
	@Field({ nullable: true }) name: string;
	@Field({ nullable: true }) id: string;
}

@ObjectType()
export class EventTagPage extends PaginateResult(EventTag) {}
