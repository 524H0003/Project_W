import { Field, InputType } from '@nestjs/graphql';
import { ITagInfo } from './tag.model';

@InputType()
export class EventTagAssign implements ITagInfo {
	@Field() name: string;
}

@InputType()
export class EventTagAttach implements ITagInfo {
	@Field() name: string;
	@Field() eventId: string;
}
