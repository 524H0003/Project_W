import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IEmployeeHookKeys,
	IEmployeeInfoKeys,
	IEmployeeSignupKeys,
} from 'build/models';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';

/**
 * Employee service
 */
@Injectable()
export class EmployeeService extends DatabaseRequests<Employee> {
	constructor(
		@InjectRepository(Employee) repo: Repository<Employee>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Employee request hook service
	 */
	async hook(input: IEmployeeHook, host: string, mtdt: string) {
		input = InterfaceCasting.quick(input, IEmployeeHookKeys);

		const ent = await this.svc.enterprise.findOne({
			baseUser: { name: input.enterpriseName },
		});
		if (!ent || !input.enterpriseName)
			throw new ServerException('Invalid', 'Enterprise', '', 'user');

		return this.svc.hook.assign(
			mtdt,
			(signature: string) =>
				this.svc.mail.send(
					ent.baseUser.email,
					`An account assignment request from ${input.name}`,
					'sendSignatureEmployee',
					{
						signature,
						name: input.name,
						email: input.email,
						position: input.position,
					},
				),
			{ enterpriseId: ent.id },
		);
	}

	/**
	 * Sign up for employee
	 * @param {IEmployeeSignup} input - the sign up input
	 * @param {Express.Multer.File} avatar - employee's avatar
	 * @param {IAuthSignUpOption} option - function's option
	 * @return {Promise<Employee>}
	 */
	async assign(
		input: IEmployeeSignup & { enterpriseId: string },
		avatar: Express.Multer.File = null,
	): Promise<Employee> {
		const enterprise = await this.svc.enterprise.id(
			input.enterpriseId || input.id,
		);
		input = InterfaceCasting.quick(input, IEmployeeSignupKeys);

		if (!enterprise)
			throw new ServerException('Invalid', 'Enterprise', '', 'user');

		const usr = await this.svc.auth.signUp(input, avatar, {
				role: UserRole.enterprise,
			}),
			eventCreator = await this.svc.eventcreator.assign(usr);

		return await this.save({
			eventCreator,
			enterprise,
			...InterfaceCasting.quick(input, IEmployeeInfoKeys),
		});
	}
}
