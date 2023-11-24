import { ApiProperty } from '@nestjs/swagger';

export class CreateErrorDto {
  @ApiProperty({ example: '000001' })
  serial_number: string;

  @ApiProperty({ example: 'error 1' })
  text_error: string;
}
