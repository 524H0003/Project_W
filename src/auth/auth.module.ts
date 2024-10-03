import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DeviceModule } from 'device/device.module';
import { EnterpriseModule } from 'enterprise/enterprise.module';
import { EventModule } from 'event/event.module';
import { FileModule } from 'file/file.module';
import { UserModule } from 'user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfgSvc: ConfigService) => {
				return {
					secret: cfgSvc.get('ACCESS_SECRET'),
					signOptions: { expiresIn: cfgSvc.get('ACCESS_EXPIRE') },
				};
			},
		}),
		// Foreign modules
		FileModule,
		forwardRef(() => DeviceModule),
		forwardRef(() => UserModule),
		EnterpriseModule,
		EventModule,
	],
	providers: [
		AuthService,
		// Strategies
		AccessStrategy,
		RefreshStrategy,
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
