import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
import { FindStudent, StudentPage } from './student.dto';
import { Paging } from 'app/app.graphql';
import { StudentService } from './student.service';
import { paginateResponse } from 'app/graphql/graphql.utils';

@Resolver()
@UseGuards(AccessGuard)
export class StudentResolver {
	/**
	 * Initiate student resolver
	 */
	constructor(private student: StudentService) {}

	// Queries
	/**
	 * Query student by id
	 */
	@Query(() => StudentPage) @Allow([]) async getStudents(
		@Args('input') student: FindStudent,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	): Promise<StudentPage> {
		return paginateResponse(
			this.student,
			await this.student.find({
				...student,
				user: { ...student, baseUser: student },
				take,
				skip: take * index,
			}),
			{ take, index },
		);
	}
}
