import { Module } from '@nestjs/common';
import { loadEnv } from 'app/module/config.module';

@Module({
	imports: [loadEnv],
})
export class TypeOrmModule {}
