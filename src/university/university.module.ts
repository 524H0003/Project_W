import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { AuthModule } from 'auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Faculty, Student]),
		forwardRef(() => AuthModule),
	],
	providers: [StudentService],
	controllers: [StudentController],
})
export class UniversityModule {}
