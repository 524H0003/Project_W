import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enterprise } from './enterprise.entity';

@Module({ imports: [TypeOrmModule.forFeature([Enterprise])] })
export class EnterpriseModule {}
