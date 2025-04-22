import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { IEventCreatorEntity } from './creator.model';
import { type NonFunctionProperties, ParentId } from 'app/typeorm/typeorm.utils';
import { IEventCreatorInfoKeys } from 'build/models';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Event creator model
 */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'EventCreator' })
export class EventCreator extends ParentId implements IEventCreatorEntity {
	/**
	 * Create event creator entity with infomations
	 * @param {NonFunctionProperties<IEventCreatorEntity>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IEventCreatorEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IEventCreatorInfoKeys));
		this.user = new User(payload.user);
		this.createdEvents = payload.createdEvents?.map((i) => new Event(i));
	}

	// Core Entity
	/**
	 * Base user
	 */
	@OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
	user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.eventCreatedBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * Entity parent id
	 */
	get pid() {
		return this.user.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ user });
	}
}
