import { ApiProperty } from '@nestjs/swagger';

export class VerifyAuthDto {
  @ApiProperty()
  token: string;
}
