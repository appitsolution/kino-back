import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ErrorService } from './error.service';
import { CreateErrorDto } from './dto/create-error.dto';
import { UpdateErrorDto } from './dto/update-error.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('error')
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Get('start')
  startError() {
    return this.errorService.startError();
  }

  @ApiQuery({ name: 'serial_number', required: true })
  @ApiQuery({ name: 'user_id', required: true })
  @Get('check-last')
  async checkLastError(
    @Query() args: { serial_number: string; user_id: number },
  ) {
    return this.errorService.checkLastError(args.serial_number, args.user_id);
  }

  @ApiQuery({ name: 'serial_number', required: true })
  @ApiQuery({ name: 'user_id', required: true })
  @Get('read-last')
  readLastError(@Query() args: { serial_number: string; user_id: number }) {
    return this.errorService.readLastError(args.serial_number, args.user_id);
  }
}
