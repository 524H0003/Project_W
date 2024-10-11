import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hook } from './hook.entity';
import { MailModule } from 'app/mail/mail.module';
import { HookService } from './hook.service';
import { AuthModule } from 'auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Hook]),
		MailModule,
		forwardRef(() => AuthModule),
	],
	providers: [HookService],
	exports: [HookService],
})
export class HookModule {}
