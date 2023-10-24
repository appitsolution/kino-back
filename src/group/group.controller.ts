import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/constants/roles';

@Controller('group')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiQuery({ name: 'user_id', required: true })
  @ApiBearerAuth()
  @Get('quick')
  async groupQuick(@Query() args: { user_id: number }) {
    return this.groupService.groupQuick(args.user_id);
  }

  @ApiQuery({ name: 'group_name' })
  @ApiQuery({ name: 'user_id' })
  @ApiBearerAuth()
  @Get('device')
  async groupDevice(@Query() args: { group_name: string; user_id: number }) {
    return this.groupService.groupDevice(args.group_name, args.user_id);
  }

  @ApiBody({ type: CreateGroupDto })
  @ApiBearerAuth()
  @Post('device')
  @Roles(Role.SUPER_ADMIN, Role.CLIENT, Role.ADMIN, Role.MANAGER)
  async groupDevicePost(
    @Body()
    args: {
      user_id: number;
      group_name: string;
      apparatus: [id: number];
    },
  ) {
    return this.groupService.groupDevicePost(
      args.user_id,
      args.group_name,
      args.apparatus,
    );
  }

  @ApiBody({ type: UpdateGroupDto })
  @ApiBearerAuth()
  @Put('device')
  @Roles(Role.SUPER_ADMIN, Role.CLIENT, Role.ADMIN, Role.MANAGER)
  async groupDevicePut(
    @Body()
    args: {
      group_name: string;
      update_name: string;
      user_id: number;
      update_apparatuses: number[];
    },
  ) {
    return this.groupService.groupDevicePut(
      args.group_name,
      args.update_name,
      args.user_id,
      args.update_apparatuses,
    );
  }

  @ApiQuery({ name: 'group_name' })
  @ApiQuery({ name: 'user_id' })
  @ApiBearerAuth()
  @Delete('device')
  @Roles(Role.SUPER_ADMIN, Role.CLIENT, Role.ADMIN, Role.MANAGER)
  async groupDeviceDelete(
    @Query() args: { group_name: string; user_id: number },
  ) {
    return this.groupService.groupDeviceDelete(args.group_name, args.user_id);
  }
}
