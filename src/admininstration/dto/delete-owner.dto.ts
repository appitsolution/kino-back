import { ApiProperty } from '@nestjs/swagger';

export class DeleteOwnerDto {
  @ApiProperty()
  owner: string;
}
