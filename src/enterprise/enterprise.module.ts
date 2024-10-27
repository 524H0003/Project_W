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
import { EmployeeService } from './employee/employee.service';
import { EventModule } from 'event/event.module';
import { UserModule } from 'user/user.module';
import { EnterpriseController } from './enterprise.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([Enterprise, Employee]),
		AuthModule,
		DeviceModule,
		HookModule,
		EventModule,
		UserModule,
	],
	providers: [EmployeeService],
	controllers: [EmployeeController, EnterpriseController],
	exports: [EmployeeService],
})
export class EnterpriseModule {
	constructor() {
		registerEnumType(EmployeePosition, { name: 'EmployeePosition' });
	}
}
