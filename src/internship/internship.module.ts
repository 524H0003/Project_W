import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraineeStatus } from 'types';
import { Internship } from './internship.entity';

@Module({ imports: [TypeOrmModule.forFeature([Internship])] })
export class InternshipModule {
	constructor() {
		registerEnumType(TraineeStatus, { name: 'TraineeStatus' });
	}
}
