import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IEmployeeHook, IEmployeeSignUp } from './employee.model';
import { MetaData } from 'auth/guards';
import { IEmployeeRelationshipKeys } from 'build/models';

/**
 * Employee service
 */
@Injectable()
export class EmployeeService extends DatabaseRequests<Employee> {
	/**
	 * Initiate employee service
	 */
	constructor(
		@InjectRepository(Employee) repo: Repository<Employee>,
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
	) {
		super(repo, Employee);
	}

	/**
	 * Employee request hook service
	 */
	async hook(
		{ name, email, position, enterpriseName }: IEmployeeHook,
		mtdt: MetaData,
	) {
		const ent = await this.svc.enterprise.findOne({
			baseUser: { name: enterpriseName },
			cache: false,
		});
		if (ent.isNull() || !enterpriseName)
			throw new ServerException('Invalid', 'Enterprise', '');

		return this.svc.hook.assign(
			mtdt,
			(signature: string) =>
				this.svc.mail.send(
					ent.baseUser.email,
					`An account assignment request from ${name}`,
					'sendSignatureEmployee',
					{ signature, name, email, position },
				),
			{ id: ent.id, name, email, position },
		);
	}

	// Abstract
	/**
	 * Sign up for employee
	 * @param {IEmployeeSignUp} input - the sign up input
	 * @param {MulterFile} avatar - employee's avatar
	 * @return {Promise<Employee>}
	 */
	async assign(
		{ id, position, ...form }: IEmployeeSignUp,
		avatar: MulterFile = null,
	): Promise<Employee> {
		const enterprise = await this.svc.enterprise.id(id);

		if (enterprise.isNull())
			throw new ServerException('Invalid', 'Enterprise', '');

		const user = await this.svc.auth.signUp(form, avatar, {
				role: UserRole.enterprise,
			}),
			eventCreator = await this.svc.eventCreator.assign(user);

		return this.save({ eventCreator, enterprise, position });
	}

	public async modify(
		id: string,
		update: DeepPartial<Employee>,
		raw?: boolean,
	): Promise<void> {
		await this.svc.eventCreator.modify(id, update.eventCreator)
		update = InterfaceCasting.delete(update, IEmployeeRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
