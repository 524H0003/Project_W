import { Resolver } from '@nestjs/graphql';
import { DeviceService } from './device.service';

@Resolver()
export class DeviceResolver {
	constructor(private readonly deviceService: DeviceService) {}
}
