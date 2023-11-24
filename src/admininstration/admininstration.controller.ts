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
import { AdmininstrationService } from './admininstration.service';
import { CreateUserDto } from './dto/register-user.dto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { CreateOwnerDto } from './dto/register-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { DeleteOwnerDto } from './dto/delete-owner.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role } from 'src/constants/roles';

@Controller('admininstration')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdmininstrationController {
  constructor(
    private readonly admininstrationService: AdmininstrationService,
  ) {}

  @ApiQuery({ name: 'user_id' })
  @ApiBearerAuth()
  @Get('quick')
  async adminQuick(@Query() args: { user_id: number }) {
    return this.admininstrationService.adminQuick(args.user_id);
  }

  @ApiQuery({ name: 'id' })
  @ApiBearerAuth()
  @Get('one')
  async adminUserFindOne(@Query() args: { id: number }) {
    return this.admininstrationService.adminUserFindOne(args.id);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth()
  @Post('user')
  @Roles(Role.SUPER_ADMIN, Role.DEALER, Role.CLIENT, Role.ADMIN)
  async adminRegisterUser(@Body() args: { login: string; password: string }) {
    return this.admininstrationService.adminRegisterUser(
      args.login,
      args.password,
    );
  }

  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  @Put('user')
  @Roles(Role.SUPER_ADMIN, Role.DEALER, Role.CLIENT, Role.ADMIN)
  async adminUpdateUser(@Body() args: { login: string; newPassword: string }) {
    return this.admininstrationService.adminUpdateUser(
      args.login,
      args.newPassword,
    );
  }

  @ApiBody({ type: DeleteUserDto })
  @ApiBearerAuth()
  @Delete('user')
  @Roles(Role.SUPER_ADMIN, Role.DEALER, Role.CLIENT, Role.ADMIN)
  async adminDeleteUser(@Body() args: { login: string }) {
    return this.admininstrationService.adminDeleteUser(args.login);
  }

  @ApiBody({ type: CreateOwnerDto })
  @ApiBearerAuth()
  @Post('owner')
  @Roles(Role.SUPER_ADMIN, Role.DEALER)
  async adminRegisterOwner(@Body() args: { owner: string }) {
    return this.admininstrationService.adminRegisterOwner(args.owner);
  }

  @ApiBody({ type: UpdateOwnerDto })
  @ApiBearerAuth()
  @Put('owner')
  @Roles(Role.SUPER_ADMIN, Role.DEALER)
  async adminUpdateOwner(@Body() args: { owner: string; newOwner: string }) {
    return this.admininstrationService.adminUpdateOwner(
      args.owner,
      args.newOwner,
    );
  }

  @ApiBody({ type: DeleteOwnerDto })
  @ApiBearerAuth()
  @Delete('owner')
  @Roles(Role.SUPER_ADMIN, Role.DEALER)
  async adminDeleteOwner(@Body() args: { owner: string }) {
    return this.admininstrationService.adminDeleteOwner(args.owner);
  }
}
