import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FileModule } from 'file/file.module';
import { UserModule } from 'user/user.module';
import { AuthService, SignService } from './auth.service';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { LocalHostStrategy } from './strategies/localhost.strategy';
import { HookModule } from './hook/hook.module';
import { HookStrategy } from './strategies/hook.strategy';
import { DeviceModule } from 'auth/device/device.module';
import { RoleGuard } from './auth.guard';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.register({ global: true }),
		// User module
		forwardRef(() => UserModule),
		// Client authencation module
		forwardRef(() => DeviceModule),
		forwardRef(() => HookModule),
		// File module
		FileModule,
	],
	providers: [
		AuthService,
		SignService,
		// Strategies
		AccessStrategy,
		RefreshStrategy,
		LocalHostStrategy,
		HookStrategy,
		RoleGuard,
	],
	exports: [AuthService, SignService, HookModule, DeviceModule, FileModule],
})
export class AuthModule {}
