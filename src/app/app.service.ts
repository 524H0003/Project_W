import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from './utils/typeorm.utils';
import { BaseUser } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
	private baseUsrReq: DatabaseRequests<BaseUser>;

	constructor(@InjectRepository(BaseUser) baseUsrRpo: Repository<BaseUser>) {
		this.baseUsrReq = new DatabaseRequests(baseUsrRpo);
	}

	assignBaseUser() {
		return this.baseUsrReq.save({});
	}

	userEmail(input: string) {
		return this.baseUsrReq.findOne({ email: input });
	}
}
