import { ApiProperty } from '@nestjs/swagger';

export class UpdateComplectationAboutDeviceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  apparatus_id: number;

  @ApiProperty()
  new_component_type_id: number;

  @ApiProperty()
  title: number;
}
