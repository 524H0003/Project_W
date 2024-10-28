import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { NotificationModule } from 'notification/notification.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), NotificationModule],
	providers: [UserResolver, UserService],
	exports: [UserService],
})
export class UserModule {
	constructor() {
		registerEnumType(UserRole, { name: 'UserRole' });
	}
}
