import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { File } from './file.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@Resolver(() => File)
@UseGuards(RoleGuard)
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
		@CurrentUser() user: User,
	) {
		return this.svc.file.assign(
			await this.svc.file.GQLUploadToMulterFile(file),
			user,
		);
	}
}
