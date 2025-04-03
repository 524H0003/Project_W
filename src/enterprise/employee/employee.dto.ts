import { ApiHideProperty } from '@nestjs/swagger';
import {
	EmployeePosition,
	IEmployeeHook,
	IEmployeeSignUp,
} from './employee.model';
import { ISignature } from 'app/hook/hook.model';

export class EmployeeHook implements IEmployeeHook {
	enterpriseName: string;
	name: string;
	@ApiHideProperty() avatarPath?: string;
	email: string;
	@ApiHideProperty() id?: string;
	position: EmployeePosition;
}

export class EmployeeSignUp
	implements Pick<IEmployeeSignUp, 'password'>, ISignature
{
	signature: string;
	password: string;
}
