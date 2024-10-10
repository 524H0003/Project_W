import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from 'auth/device/device.module';
import { Session } from './session.entity';
import { SessionService } from './session.service';
import { AuthModule } from 'auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Session]),
		forwardRef(() => AuthModule),
		forwardRef(() => DeviceModule),
	],
	providers: [SessionService],
	exports: [SessionService],
})
export class SessionModule {}
