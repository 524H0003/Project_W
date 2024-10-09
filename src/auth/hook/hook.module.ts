import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hook } from './hook.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Hook])],
})
export class HookModule {}
