import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { AppModule } from 'app/app.module';
import { FacultyController } from './faculty/faculty.controller';
import { FacultyService } from './faculty/faculty.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Faculty, Student]),
		forwardRef(() => AppModule),
	],
	providers: [StudentService, StudentController, FacultyService],
	controllers: [StudentController, FacultyController],
	exports: [StudentController, StudentService, FacultyService],
})
export class UniversityModule {}
