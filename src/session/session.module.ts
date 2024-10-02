import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from 'device/device.module';
import { Session } from './session.entity';
import { SessionService } from './session.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Session]),
		forwardRef(() => DeviceModule),
	],
	providers: [SessionService],
	exports: [SessionService],
})
export class SessionModule {}
