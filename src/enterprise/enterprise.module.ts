import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/employee.entity';
import { EmployeePosition } from './employee/employee.model';
import { Enterprise } from './enterprise.entity';

@Module({ imports: [TypeOrmModule.forFeature([Enterprise, Employee])] })
export class EnterpriseModule {
	constructor() {
		registerEnumType(EmployeePosition, { name: 'EmployeePosition' });
	}
}
