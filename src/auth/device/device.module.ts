import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [TypeOrmModule.forFeature([Device]), forwardRef(() => AppModule)],
	providers: [DeviceService],
	exports: [DeviceService],
})
export class DeviceModule {}
