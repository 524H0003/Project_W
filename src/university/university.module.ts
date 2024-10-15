import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { UserModule } from 'user/user.module';
import { AuthModule } from 'auth/auth.module';
import { DeviceModule } from 'auth/device/device.module';
import { HookModule } from 'auth/hook/hook.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Faculty, Student]),
		UserModule,
		AuthModule,
		DeviceModule,
		HookModule,
	],
	providers: [StudentService, StudentController],
	controllers: [StudentController],
	exports: [StudentController],
})
export class UniversityModule {}
