import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { UserModule } from 'user/user.module';
import { AuthModule } from 'auth/auth.module';
import { DeviceModule } from 'auth/device/device.module';
import { SessionModule } from 'auth/session/session.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Faculty, Student]),
		forwardRef(() => UserModule),
		forwardRef(() => AuthModule),
		forwardRef(() => DeviceModule),
		forwardRef(() => SessionModule),
	],
	providers: [StudentService],
	controllers: [StudentController],
})
export class University {}
