import { ApiProperty } from '@nestjs/swagger';

export class UpdateOwnerDto {
  @ApiProperty()
  owner: string;

  @ApiProperty()
  newOwner: string;
}
