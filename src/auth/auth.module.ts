import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService, SignService } from './auth.service';
import { AccessStrategy } from './guards/access.strategy';
import { RefreshStrategy } from './guards/refresh.strategy';
import { HookStrategy } from './guards/hook.strategy';
import { AppModule } from 'app/app.module';
import { AccessGuard, HookGuard, LocalhostGuard, RefreshGuard } from './guards';

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
		HookStrategy,
		// Guards
		AccessGuard,
		RefreshGuard,
		HookGuard,
		LocalhostGuard,
	],
	exports: [SignService, AuthService],
})
export class AuthModule {}
