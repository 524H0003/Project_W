import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { IUserSensitive, IUserSignUp } from 'user/user.model';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserInfoKeys,
	IUserAuthenticationKeys,
	IUserSensitiveKeys,
} from 'build/models';
import { IEventCreatorEntity } from './creator.model';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator extends BaseEntity implements IEventCreatorEntity {
	/**
	 * Create event creator entity with infomations
	 */
	constructor(payload: IUserSignUp & IUserSensitive) {
		super();

		if (payload) {
			this.user = new User(
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserInfoKeys,
					...IUserSensitiveKeys,
				]),
			);
		}
	}

	// Core Entity
	/**
	 * Base user
	 */
	@Column(() => User, { prefix: false }) user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.eventCreatedBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * Get entity id
	 */
	get id(): string {
		return this.user.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ ...user, ...user.baseUser });
	}
}
