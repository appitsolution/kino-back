import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty()
  login: string;

  @ApiProperty()
  password: string;
}
