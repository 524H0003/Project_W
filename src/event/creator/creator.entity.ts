import { Column, Entity, OneToMany } from 'typeorm';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { IUserSignUp } from 'user/user.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserKeys, IUserAuthenticationKeys } from 'models';
import { IEventCreatorEntity } from './creator.model';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator implements IEventCreatorEntity {
	/**
	 * Create event creator entity with infomations
	 */
	constructor(payload: IUserSignUp) {
		if (payload) {
			this.user = new User(
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserKeys,
				]),
			);
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => User, { prefix: false })
	user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.eventCreatedBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ ...user, ...user.base });
	}
}
