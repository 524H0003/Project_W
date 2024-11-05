import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { IAuthSignUpOption } from 'auth/auth.model';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IEmployeeHookKeys,
	IEmployeeInfoKeys,
	IEmployeeSignupKeys,
} from 'models';
import { AuthService } from 'auth/auth.service';
import { EventCreatorService } from 'event/creator/creator.service';
import { UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { EnterpriseService } from 'enterprise/enterprise.service';
import { HookService } from 'app/hook/hook.service';

/**
 * Employee service
 */
@Injectable()
export class EmployeeService extends DatabaseRequests<Employee> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Employee) repo: Repository<Employee>,
		private authSvc: AuthService,
		private envCreSvc: EventCreatorService,
		private usrSvc: UserService,
		private entSvc: EnterpriseService,
		private hookSvc: HookService,
	) {
		super(repo);
	}

	/**
	 * Employee request hook service
	 */
	async hook(input: IEmployeeHook, host: string, mtdt: string) {
		input = InterfaceCasting.quick(input, IEmployeeHookKeys);

		const ent = await this.entSvc.findOne({
			user: { name: input.enterpriseName },
		});
		if (!ent || !input.enterpriseName)
			throw new BadRequestException('Invalid_Enterprise_Name');

		return this.hookSvc.assignViaEmail(ent.user.email, host, mtdt, {
			enterpriseName: ent.user.name,
		});
	}

	/**
	 * Sign up for employee
	 * @param {IEmployeeSignup} input - the sign up input
	 * @param {Express.Multer.File} avatar - employee's avatar
	 * @param {IAuthSignUpOption} option - function's option
	 * @return {Promise<Employee>}
	 */
	async signUp(
		input: IEmployeeSignup,
		avatar: Express.Multer.File,
		enterpriseName: string,
		option?: IAuthSignUpOption,
	): Promise<Employee> {
		input = InterfaceCasting.quick(input, IEmployeeSignupKeys);

		try {
			const usr = await this.authSvc.signUp(input, avatar, {
					...option,
					role: UserRole.enterprise,
				}),
				eventCreator = await this.envCreSvc.assign(usr);

			return await this.save({
				eventCreator,
				enterprise: await this.entSvc.findOne({
					user: { name: enterpriseName },
				}),
				...InterfaceCasting.quick(input, IEmployeeInfoKeys),
			});
		} catch (error) {
			switch ((error as { message: string }).message) {
				default:
					throw error;
					break;
			}
		}
	}
}
