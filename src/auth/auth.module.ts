import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventModule } from 'event/event.module';
import { FileModule } from 'file/file.module';
import { UserModule } from 'user/user.module';
import { NotificationModule } from 'notification/notification.module';
import { AuthService, SignService } from './auth.service';
import { EnterpriseModule } from 'enterprise/enterprise.module';
import { AuthController } from './auth.controller';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { LocalHostStrategy } from './strategies/localhost.strategy';
import { HookModule } from './hook/hook.module';
import { HookStrategy } from './strategies/hook.strategy';
import { DeviceModule } from 'auth/device/device.module';
import { UniversityModule } from 'university/university.module';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.register({ global: true }),
		// Foreign modules
		EventModule,
		NotificationModule,
		FileModule,
		forwardRef(() => DeviceModule),
		forwardRef(() => UserModule),
		EnterpriseModule,
		HookModule,
		forwardRef(() => UniversityModule),
	],
	providers: [
		AuthService,
		SignService,
		// Strategies
		AccessStrategy,
		RefreshStrategy,
		LocalHostStrategy,
		HookStrategy,
	],
	controllers: [AuthController],
	exports: [AuthService, SignService, DeviceModule, UserModule, HookModule],
})
export class AuthModule {}
