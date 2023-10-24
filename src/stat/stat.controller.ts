import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatService } from './stat.service';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('stat')
@UseGuards(AuthGuard('jwt'))
export class StatController {
  constructor(private readonly statService: StatService) {}

  @ApiQuery({ name: 'user_id' })
  @ApiBearerAuth()
  @Get('start')
  async statStart(@Query('user_id') user_id: number) {
    return this.statService.statStart(user_id);
  }

  @ApiQuery({ name: 'serial_number', required: false })
  @ApiQuery({ name: 'group_name', required: false })
  @ApiQuery({ name: 'user_id' })
  @ApiQuery({ name: 'date' })
  @ApiBearerAuth()
  @Get('quick')
  async statQuick(
    @Query()
    args: {
      serial_number: string;
      group_name: string;
      user_id: number;
      date: string;
    },
  ) {
    return this.statService.statQuick(
      args.serial_number,
      args.group_name,
      Number(args.user_id),
      args.date,
    );
  }

  @ApiQuery({ name: 'serial_number', required: false })
  @ApiQuery({ name: 'group_name', required: false })
  @ApiQuery({ name: 'date' })
  @ApiQuery({ name: 'user_id' })
  @ApiQuery({ name: 'typeOfData' })
  @ApiQuery({ name: 'interval' })
  @ApiBearerAuth()
  @Get('all')
  async statAll(
    @Query()
    args: {
      serial_number: string;
      group_name: string;
      date: string;
      user_id: number;
      typeOfData: string;
      interval: string;
    },
  ) {
    return this.statService.statAll(
      args.serial_number,
      args.group_name,
      args.date,
      args.user_id,
      args.typeOfData,
      args.interval,
    );
  }
}
