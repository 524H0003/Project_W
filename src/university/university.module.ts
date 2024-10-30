import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Faculty, Student]),
		forwardRef(() => AppModule),
	],
	providers: [StudentService, StudentController],
	controllers: [StudentController],
	exports: [StudentController],
})
export class UniversityModule {}
