import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { SessionModule } from 'auth/session/session.module';
import { Device } from './device.entity';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';

@Module({
	imports: [
		forwardRef(() => AuthModule),
		TypeOrmModule.forFeature([Device]),
		forwardRef(() => SessionModule),
	],
	providers: [DeviceResolver, DeviceService],
	exports: [DeviceService, SessionModule],
})
export class DeviceModule {}
