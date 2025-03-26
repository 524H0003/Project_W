import { Args, Query, Resolver } from '@nestjs/graphql';
import { Student } from './student.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
import { AppService } from 'app/app.service';
import { FindStudent } from './student.dto';
import { Paging } from 'app/app.graphql';

@Resolver(() => Student)
@UseGuards(AccessGuard)
export class StudentResolver {
	/**
	 * Initiate student resolver
	 */
	constructor(protected svc: AppService) {}

	// Queries
	/**
	 * Query student by id
	 */
	@Query(() => [Student]) @Allow([]) getStudents(
		@Args('input') student: FindStudent,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	) {
		return this.svc.student.find({
			...student,
			user: { ...student, baseUser: student },
			take,
			skip: take * index,
		});
	}
}
