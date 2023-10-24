import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  login: string;

  @ApiProperty()
  newPassword: string;
}
