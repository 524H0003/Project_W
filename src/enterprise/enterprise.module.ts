import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/employee.entity';
import { EmployeePosition } from './employee/employee.model';
import { Enterprise } from './enterprise.entity';
import { EmployeeController } from './employee/employee.controller';
import { AuthModule } from 'auth/auth.module';
import { DeviceModule } from 'auth/device/device.module';
import { HookModule } from 'auth/hook/hook.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Enterprise, Employee]),
		AuthModule,
		DeviceModule,
		HookModule,
	],
	controllers: [EmployeeController],
})
export class EnterpriseModule {
	constructor() {
		registerEnumType(EmployeePosition, { name: 'EmployeePosition' });
	}
}
