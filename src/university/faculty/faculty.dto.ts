import { ISignature } from 'app/hook/hook.model';
import { IFacultyAssign } from './faculty.model';
import { ApiHideProperty } from '@nestjs/swagger';

export class FacultyAssign implements IFacultyAssign, ISignature {
	department: string;
	password: string;
	name: string;
	@ApiHideProperty() avatarPath?: string;
	email: string;
	@ApiHideProperty() id?: string;
	signature: string;
}
