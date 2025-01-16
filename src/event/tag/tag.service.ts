import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventTag } from './tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { ITagInfo } from './tag.model';

/**
 * Event's tag service
 */
@Injectable()
export class EventTagService extends DatabaseRequests<EventTag> {
	constructor(
		@InjectRepository(EventTag) repo: Repository<EventTag>,
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Create tag
	 * @param {ITagInfo} input - tag's infomations
	 */
	async assign(input: ITagInfo): Promise<EventTag> {
		const existedTag = await this.svc.eventTag.findOne(input);

		if (existedTag) return existedTag;

		return new EventTag(await this.save({ name: input.name }));
	}

	/**
	 * Attach tag to event
	 * @param {ITagInfo} tag - tag's infomations
	 * @param {string} eventId - event's id to assign tag to
	 */
	async attach(tag: ITagInfo, eventId: string) {
		const assignedTag = await this.svc.eventTag.assign(tag);
		await this.svc.event.push(eventId, 'tags', assignedTag);
		return this.id(assignedTag.id);
	}
}
