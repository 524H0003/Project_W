import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FileModule } from 'file/file.module';
import { UserModule } from 'user/user.module';
import { AuthService, SignService } from './auth.service';
import { AuthController } from './auth.controller';
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
		// Foreign modules
		forwardRef(() => DeviceModule),
		forwardRef(() => UserModule),
		HookModule,
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
	exports: [AuthService, SignService],
})
export class AuthModule {}
