import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  group_name: string;
  @ApiProperty()
  apparatus: number[];
}
