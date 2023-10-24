import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty()
  group_name: string;

  @ApiProperty()
  update_name: string;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  update_apparatuses: number[];
}
