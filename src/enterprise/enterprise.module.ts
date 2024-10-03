import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'employee/employee.module';
import { Enterprise } from './enterprise.entity';

@Module({ imports: [TypeOrmModule.forFeature([Enterprise]), EmployeeModule] })
export class EnterpriseModule {}
