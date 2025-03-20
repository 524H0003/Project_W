import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserService } from './user.service';
import { AppModule } from 'app/app.module';
import { UserResolver } from './user.resolver';
import { BaseUser } from './base/baseUser.entity';
import { BaseUserService } from './base/baseUser.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, BaseUser]),
		forwardRef(() => AppModule),
	],
	providers: [UserService, UserResolver, BaseUserService],
	exports: [UserService, BaseUserService],
})
export class UserModule {
	constructor() {
		registerEnumType(UserRole, { name: 'UserRole' });
	}
}
