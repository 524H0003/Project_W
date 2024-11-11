import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
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
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';

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
		@Inject(forwardRef(() => AppService))
		public svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Employee request hook service
	 */
	async hook(input: IEmployeeHook, host: string, mtdt: string) {
		input = InterfaceCasting.quick(input, IEmployeeHookKeys);

		const ent = await this.svc.ent.findOne({
			baseUser: { name: input.enterpriseName },
		});
		if (!ent || !input.enterpriseName)
			throw new BadRequestException('Invalid_Enterprise_Name');

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
			'_Email',
			{ enterpriseName: ent.baseUser.name },
		);
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
			const usr = await this.svc.auth.signUp(input, avatar, {
					...option,
					role: UserRole.enterprise,
				}),
				eventCreator = await this.svc.envCre.assign(usr);

			return await this.save({
				eventCreator,
				enterprise: await this.svc.ent.findOne({
					baseUser: { name: enterpriseName },
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
