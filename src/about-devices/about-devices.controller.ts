import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AboutDevicesService } from './about-devices.service';
import { CreateAboutDeviceDto } from './dto/create-about-device.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateInfoAboutDeviceDto } from './dto/update-about-device.dto';
import { UpdateServiceAboutDeviceDto } from './dto/update-service-about-device.dto';
import { UpdateComplectationAboutDeviceDto } from './dto/update-complectation-about-device.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/constants/roles';

@Controller('about-devices')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AboutDevicesController {
  constructor(private readonly aboutDevicesService: AboutDevicesService) {}

  @ApiQuery({ name: 'user_id', type: Number })
  @ApiQuery({ name: 'lang', type: String })
  @ApiBearerAuth()
  @Get('quick')
  async aboutQuick(@Query() args: { user_id: number; lang: string }) {
    return this.aboutDevicesService.devicesQuick(args.user_id, args.lang);
  }

  @ApiQuery({ name: 'serial_number', type: String })
  @ApiQuery({ name: 'user_id' })
  @ApiQuery({ name: 'lang' })
  @ApiBearerAuth()
  @Get('devices')
  async aboutDevicesGet(
    @Query() args: { serial_number: string; user_id: number; lang: string },
  ) {
    return this.aboutDevicesService.aboutDevicesGet(
      args.serial_number,
      args.user_id,
      args.lang,
    );
  }

  @ApiQuery({ name: 'serial_number', type: String })
  @ApiQuery({ name: 'user_id' })
  @ApiBody({ type: UpdateInfoAboutDeviceDto })
  @ApiBearerAuth()
  @Put('devices/information')
  async aboutDevicesPutInformation(
    @Query()
    args: {
      serial_number: string;
      user_id: number;
    },
    @Body() updateData: any,
  ) {
    return this.aboutDevicesService.aboutDevicesPutInformataion(
      args.serial_number,
      args.user_id,
      updateData,
    );
  }

  @ApiQuery({ name: 'serial_number', type: String })
  @ApiQuery({ name: 'user_id' })
  @ApiBody({ type: [UpdateComplectationAboutDeviceDto] })
  @ApiBearerAuth()
  @Put('devices/complectation')
  @Roles(Role.SUPER_ADMIN, Role.DEALER, Role.OPERATOR)
  async aboutDevicesPutComplectation(
    @Query()
    args: {
      serial_number: string;
      user_id: number;
    },
    @Body() updateData: any,
  ) {
    return this.aboutDevicesService.aboutDevicesPutComplectation(
      args.serial_number,
      args.user_id,
      updateData,
    );
  }

  @ApiQuery({ name: 'serial_number', type: String })
  @ApiQuery({ name: 'user_id', type: String })
  @ApiBody({ type: [UpdateServiceAboutDeviceDto] })
  @ApiBearerAuth()
  @Put('devices/service')
  @Roles(Role.SUPER_ADMIN, Role.DEALER, Role.OPERATOR)
  async aboutDevicesPutService(
    @Query()
    args: {
      serial_number: string;
      user_id: number;
    },
    @Body() updateData: any,
  ) {
    return this.aboutDevicesService.aboutDevicesPutService(
      args.serial_number,
      args.user_id,
      updateData,
    );
  }

  @ApiBody({ type: CreateAboutDeviceDto })
  @ApiBearerAuth()
  @Post('devices')
  @Roles(Role.SUPER_ADMIN, Role.OPERATOR, Role.CLIENT, Role.ADMIN, Role.MANAGER)
  async aboutDevicesPost(
    @Body() args: { serial_number: string; value: string },
  ) {
    return this.aboutDevicesService.aboutDevicesUpdateTask(
      args.serial_number,
      args.value,
    );
  }
}
