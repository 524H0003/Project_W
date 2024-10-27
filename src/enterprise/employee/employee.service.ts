import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEmployeeSignup } from './employee.model';
import { IAuthSignUpOption } from 'auth/auth.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEmployeeInfoKeys, IEmployeeSignupKeys } from 'models';
import { AuthService } from 'auth/auth.service';
import { EventCreatorService } from 'event/creator/creator.service';
import { UserService } from 'user/user.service';
import { DeviceService } from 'auth/device/device.service';
import { UserRecieve } from 'user/user.class';
import { UserRole } from 'user/user.model';

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
		private dvcSvc: DeviceService,
	) {
		super(repo);
	}

	/**
	 * Sign up for employee
	 * @param {IEmployeeSignup} input - the sign up input
	 * @param {string} mtdt - client's metadata
	 * @param {Express.Multer.File} avatar - employee's avatar
	 * @param {IAuthSignUpOption} option - function's option
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async signUp(
		input: IEmployeeSignup,
		mtdt: string,
		avatar: Express.Multer.File,
		option?: IAuthSignUpOption,
	): Promise<UserRecieve> {
		input = InterfaceCasting.quick(input, IEmployeeSignupKeys);
		try {
			const usr = await this.authSvc.signUp(input, avatar, {
					...option,
					role: UserRole.enterprise,
				}),
				evtCre = await this.envCreSvc.assign(usr),
				usrRcv = await this.dvcSvc.getTokens(usr, mtdt);
			await this.save({
				user: evtCre,
				...InterfaceCasting.quick(input, IEmployeeInfoKeys),
			});
			return usrRcv;
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'ExistedUser':
					const usr = await this.authSvc.login(input),
						usrRcv = await this.dvcSvc.getTokens(usr, mtdt);
					return usrRcv;
					break;

				default:
					throw error;
					break;
			}
		}
	}
}
