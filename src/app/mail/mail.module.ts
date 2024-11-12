import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [forwardRef(() => AppModule)],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
