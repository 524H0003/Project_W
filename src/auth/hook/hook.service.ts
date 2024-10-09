import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	constructor(@InjectRepository(Hook) repo: Repository<Hook>) {
		super(repo);
	}

	async assign() {
		const signature = (128).string,
			hook = await this.save({ signature });

		return { hook, signature };
	}
}
