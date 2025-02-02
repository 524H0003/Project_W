import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { File } from './file.entity';
import { UseGuards } from '@nestjs/common';
import { GetRequest, AccessGuard, Roles } from 'auth/guards/access.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@Resolver(() => File)
@UseGuards(AccessGuard)
export class FileResolver {
	/**
	 * Initiate file resolver
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Upload file
	 */
	@Mutation(() => File) @Roles([UserRole.admin]) async uploadFile(
		@Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
		@GetRequest('user') user: User,
	) {
		return this.svc.file.assign(
			await this.svc.file.GQLUploadToMulterFile(file),
			user,
		);
	}
}
