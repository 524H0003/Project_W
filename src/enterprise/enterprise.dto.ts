import { ISignature } from 'app/app.model';
import { IEnterpriseAssign } from './enterprise.model';
import { ApiHideProperty } from '@nestjs/swagger';

export class EnterpriseAssign implements IEnterpriseAssign, ISignature {
	signature: string;
	description: string;
	industry: string;
	name: string;
	@ApiHideProperty()
	avatarPath?: string;
	email: string;
	@ApiHideProperty()
	id?: string;
}
