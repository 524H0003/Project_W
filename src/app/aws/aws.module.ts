import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from 'app/app.module';
import { AWSService } from './aws.service';

@Module({
	imports: [forwardRef(() => AppModule)],
	providers: [AWSService],
	exports: [AWSService],
})
export class AWSModule {}
