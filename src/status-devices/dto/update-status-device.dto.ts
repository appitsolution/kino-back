import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusDeviceDto } from './create-status-device.dto';

export class UpdateStatusDeviceDto extends PartialType(CreateStatusDeviceDto) {}
