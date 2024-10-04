import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';

@Module({ imports: [TypeOrmModule.forFeature([Faculty])] })
export class FacultyModule {}
