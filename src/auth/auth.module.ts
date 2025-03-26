import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessStrategy } from './guards/access.strategy';
import { RefreshStrategy } from './guards/refresh.strategy';
import { HookStrategy } from './guards/hook.strategy';
import { AppModule } from 'app/app.module';
import { AccessGuard, HookGuard, LocalhostGuard, RefreshGuard } from './guards';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		// App module
		forwardRef(() => AppModule),
	],
	providers: [
		AuthService,
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
	exports: [AuthService],
})
export class AuthModule {}
