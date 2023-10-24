import { ApiProperty } from '@nestjs/swagger';

export class CreateAboutDeviceDto {
  @ApiProperty()
  serial_number: String;

  @ApiProperty()
  value: String;
}
