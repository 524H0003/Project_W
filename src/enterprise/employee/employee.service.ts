import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
	DatabaseRequests,
	FindOptionsWithCustom,
} from 'app/utils/typeorm.utils';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterfaceCasting } from 'app/utils/utils';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IEmployeeHook, IEmployeeSignUp } from './employee.model';
import { IEmployeeInfoKeys, IEmployeeSignUpKeys } from 'build/models';
import { MetaData } from 'auth/guards';

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
			{ enterpriseId: ent.id, name, email, position },
		);
	}

	/**
	 * Sign up for employee
	 * @param {IEmployeeSignUp} input - the sign up input
	 * @param {MulterFile} avatar - employee's avatar
	 * @return {Promise<Employee>}
	 */
	async assign(
		input: IEmployeeSignUp & { enterpriseId: string },
		avatar: MulterFile = null,
	): Promise<Employee> {
		const enterprise = await this.svc.enterprise.id(
			input.enterpriseId || input.id,
		);
		input = InterfaceCasting.quick(input, IEmployeeSignUpKeys);

		if (enterprise.isNull())
			throw new ServerException('Invalid', 'Enterprise', '');

		const user = await this.svc.auth.signUp(input, avatar, {
				role: UserRole.enterprise,
				raw: true,
			}),
			eventCreator = await this.svc.eventCreator.assign(user, { raw: true });

		return this.save({
			eventCreator,
			enterprise,
			...InterfaceCasting.quick(input, IEmployeeInfoKeys),
		});
	}

	/**
	 *  Find employee base on id
	 * @param {string} id - employee id
	 * @param {FindOptionsWithCustom<Employee>} options - function options
	 */
	id(id: string, options?: FindOptionsWithCustom<Employee>): Promise<Employee> {
		if (!id) throw new ServerException('Invalid', 'ID', '');
		return this.findOne({
			eventCreator: { user: { baseUser: { id } } },
			...options,
		});
	}
}
