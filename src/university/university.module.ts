import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty/faculty.entity';
import { Student } from './student/student.entity';

@Module({ imports: [TypeOrmModule.forFeature([Faculty, Student])] })
export class University {}
