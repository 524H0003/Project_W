import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';
import { AppModule } from 'app/app.module';
import { FileResolver } from './file.resolver';
import { registerEnumType } from '@nestjs/graphql';
import { FileType } from './file.model';

@Module({
	imports: [TypeOrmModule.forFeature([File]), forwardRef(() => AppModule)],
	providers: [FileService, FileResolver],
	exports: [FileService],
	controllers: [FileController],
})
export class FileModule {
	constructor() {
		registerEnumType(FileType, { name: 'FileType' });
	}
}
