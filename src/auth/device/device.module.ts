import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { SessionModule } from 'auth/session/session.module';
import { Device } from './device.entity';
import { DeviceService } from './device.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Device]),
		forwardRef(() => AuthModule),
		forwardRef(() => SessionModule),
	],
	providers: [DeviceService],
	exports: [DeviceService, SessionModule],
})
export class DeviceModule {}
