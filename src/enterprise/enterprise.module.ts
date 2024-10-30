import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/employee.entity';
import { EmployeePosition } from './employee/employee.model';
import { Enterprise } from './enterprise.entity';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeService } from './employee/employee.service';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Enterprise, Employee]),
		forwardRef(() => AppModule),
	],
	providers: [EmployeeService, EnterpriseService],
	controllers: [EmployeeController, EnterpriseController],
	exports: [EmployeeService, EnterpriseService],
})
export class EnterpriseModule {
	constructor() {
		registerEnumType(EmployeePosition, { name: 'EmployeePosition' });
	}
}
