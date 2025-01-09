import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserService } from './user.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AppModule)],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {
	constructor() {
		registerEnumType(UserRole, { name: 'UserRole' });
	}
}
