import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { EventModule } from 'event/event.module';
import { FacultyModule } from 'university/faculty/faculty.module';
import { StudentModule } from 'university/student/student.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => AuthModule),
		StudentModule,
		FacultyModule,
		EventModule,
	],
	providers: [UserResolver, UserService],
	exports: [UserService],
	controllers: [UserController],
})
export class UserModule {
	constructor() {
		registerEnumType(UserRole, { name: 'UserRole' });
	}
}
