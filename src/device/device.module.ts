import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { SessionModule } from 'session/session.module';
import { Device } from './device.entity';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Device]),
		forwardRef(() => AuthModule),
		forwardRef(() => SessionModule),
	],
	providers: [DeviceResolver, DeviceService],
	exports: [DeviceService, SessionModule],
})
export class DeviceModule {}
