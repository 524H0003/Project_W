import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Role } from './user.model';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
	providers: [UserResolver, UserService],
	exports: [UserService],
	controllers: [UserController],
})
export class UserModule {
	constructor() {
		registerEnumType(Role, { name: 'Role' });
	}
}
