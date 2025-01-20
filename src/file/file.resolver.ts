import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { File } from './file.entity.js';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard.js';
import { AppService } from 'app/app.service.js';
import { UserRole } from 'user/user.model.js';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { User } from 'user/user.entity.js';

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
	@Mutation(() => File)
	@Roles([UserRole.admin])
	async uploadFile(
		@Args('file', { type: () => GraphQLUpload })
		file: FileUpload,
		@CurrentUser() user: User,
	) {
		await this.svc.file.assign(
			await this.svc.file.GQLUploadToMulterFile(file),
			user,
		);
	}
}
