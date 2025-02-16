import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { File } from './file.entity';
import { UseGuards } from '@nestjs/common';
import { GetRequest, AccessGuard, Allow } from 'auth/guards';
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
	@Mutation(() => File) @Allow([UserRole.admin]) async uploadFile(
		@Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
		@GetRequest('user') { id }: User,
	) {
		return this.svc.file.assign(this.svc.file.GQLUploadToMulterFile(file), id);
	}
}
