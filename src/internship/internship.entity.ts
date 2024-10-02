import { Field } from '@nestjs/graphql';
import { IsLatitude, IsLongitude } from 'class-validator';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Student } from 'student/student.entity';
import { Column, Entity, Index, ManyToOne, Point } from 'typeorm';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { IInternship, TraineeStatus } from './internship.model';

@Entity()
export class Internship extends SensitiveInfomations implements IInternship {
	// Relationships
	@ManyToOne(() => Student, (_: Student) => _.internships)
	trainee: Student;

	@ManyToOne(() => Enterprise, (_: Enterprise) => _)
	enterprise: Enterprise;

	// Infomations
	@Column()
	enterpriseAccepted: boolean;

	@Column()
	traineeAccepted: boolean;

	@Column()
	interviewAt: Date;

	@Index({ spatial: true })
	@Column({ type: 'geography', spatialFeatureType: 'Point' })
	private location: Point = { type: 'Point', coordinates: [0, 0] };

	private _interviewLongitude: number;
	@IsLongitude()
	@Field()
	set interviewLongitude(i: number) {
		this.location.coordinates[0] = i;
		this._interviewLongitude = i;
	}
	get interviewLongitude() {
		if (this.location[0]) return this.location[0];
		return this._interviewLongitude;
	}

	private _interviewLatitude: number;
	@IsLatitude()
	@Field()
	set interviewLatitude(i: number) {
		this.location.coordinates[1] = i;
		this._interviewLatitude = i;
	}
	get interviewLatitude() {
		if (this.location[1]) return this.location[1];
		return this._interviewLatitude;
	}

	@Column({
		type: 'enum',
		enum: TraineeStatus,
		array: true,
		default: [TraineeStatus.PENDING],
	})
	TraineeStatus: TraineeStatus;
}
