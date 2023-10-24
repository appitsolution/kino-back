import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceAboutDeviceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  newValue: number;
}
