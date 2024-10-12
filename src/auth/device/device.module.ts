import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { SessionModule } from 'auth/session/session.module';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

@Module({
	imports: [
		forwardRef(() => AuthModule),
		TypeOrmModule.forFeature([Device]),
		forwardRef(() => SessionModule),
	],
	providers: [DeviceService],
	exports: [DeviceService, SessionModule],
})
export class DeviceModule {}
