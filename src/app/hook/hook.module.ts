import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hook } from './hook.entity';
import { HookService } from './hook.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [TypeOrmModule.forFeature([Hook]), forwardRef(() => AppModule)],
	providers: [HookService],
	exports: [HookService],
})
export class HookModule {}
