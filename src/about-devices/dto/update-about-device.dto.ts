import { ApiProperty } from '@nestjs/swagger';

export class UpdateInfoAboutDeviceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  owner: number;

  @ApiProperty()
  user: number;

  @ApiProperty()
  shipment_date: Date;

  @ApiProperty()
  commissioning_date: Date;

  @ApiProperty({ example: 'ua' })
  lang: string;
}
