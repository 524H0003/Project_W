import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';

@Module({
	imports: [TypeOrmModule.forFeature([File])],
	providers: [FileService],
	exports: [FileService],
	controllers: [FileController],
})
export class FileModule {
	constructor() {}
}
