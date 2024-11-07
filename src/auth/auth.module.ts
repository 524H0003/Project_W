import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService, SignService } from './auth.service';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { LocalHostStrategy } from './strategies/localhost.strategy';
import { HookStrategy } from './strategies/hook.strategy';
import { RoleGuard } from './auth.guard';
import { AppModule } from 'app/app.module';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.register({ global: true }),
		// App module
		forwardRef(() => AppModule),
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
	exports: [SignService, AuthService],
})
export class AuthModule {}
