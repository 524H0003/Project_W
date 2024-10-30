import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionService } from './session.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [TypeOrmModule.forFeature([Session]), forwardRef(() => AppModule)],
	providers: [SessionService],
	exports: [SessionService],
})
export class SessionModule {}
