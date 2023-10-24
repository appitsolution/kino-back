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
import { StatusDevicesService } from './status-devices.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('status-devices')
@UseGuards(AuthGuard('jwt'))
export class StatusDevicesController {
  constructor(private readonly statusDevicesService: StatusDevicesService) {}

  @ApiQuery({ name: 'user_id' })
  @ApiQuery({ name: 'lang' })
  @ApiBearerAuth()
  @Get('quick')
  async statusDevicesQuick(@Query() args: { user_id: number; lang: string }) {
    return this.statusDevicesService.statusDevicesQuick(
      args.user_id,
      args.lang,
    );
  }

  @ApiQuery({ name: 'serial_number' })
  @ApiQuery({ name: 'lang' })
  @ApiBearerAuth()
  @Get('device')
  async statusDevicesDevice(
    @Query() args: { serial_number: string; lang: string },
  ) {
    return this.statusDevicesService.statusDevicesDevice(
      args.serial_number,
      args.lang,
    );
  }

  @ApiQuery({ name: 'serial_number' })
  @ApiQuery({ name: 'user_id' })
  @ApiBearerAuth()
  @Post('cleaning')
  async statusDevicesCleaning(
    @Query() args: { serial_number: string; user_id: number },
  ) {
    return this.statusDevicesService.statusDevicesCleaning(
      args.serial_number,
      args.user_id,
    );
  }

  @ApiQuery({ name: 'serial_number' })
  @ApiQuery({ name: 'user_id' })
  @ApiQuery({ name: 'level' })
  @ApiBearerAuth()
  @Post('loading')
  async statusDevicesLoading(
    @Query() args: { serial_number: string; user_id: number; level: number },
  ) {
    return this.statusDevicesService.statusDevicesLoading(
      args.serial_number,
      args.user_id,
      args.level,
    );
  }
}
