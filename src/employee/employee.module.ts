import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { EmployeePosition } from './employee.model';

@Module({ imports: [TypeOrmModule.forFeature([Employee])] })
export class EmployeeModule {
	constructor() {
		registerEnumType(EmployeePosition, { name: 'EmployeePosition' });
	}
}
