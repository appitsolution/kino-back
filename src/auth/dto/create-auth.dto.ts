import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty()
  role: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  password: string;
}
