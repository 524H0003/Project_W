import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'app/app.module';
import { Bloc } from './bloc.entity';
import { BlocService } from './bloc.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Bloc], 'sqlite_db'),
		forwardRef(() => AppModule),
	],
	providers: [BlocService],
	exports: [BlocService],
})
export class BlocModule {}
