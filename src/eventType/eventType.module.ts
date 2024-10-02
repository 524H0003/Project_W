import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventType } from './eventType.entity';

@Module({ imports: [TypeOrmModule.forFeature([EventType])] })
export class EventTypeModule {}
