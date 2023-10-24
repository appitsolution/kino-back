// secure.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from './user-roles.decorator';

@Controller('secure')
@UseGuards(AuthGuard('jwt'))
export class SecureController {
  @Get()
  getSecureData(@UserRoles() roles: string[]) {
    // Добавьте декоратор для извлечения ролей
    if (roles.includes('admin')) {
      return 'Это защищенный маршрут для администраторов';
    } else if (roles.includes('user')) {
      return 'Это защищенный маршрут для пользователей';
    } else {
      return 'Это защищенный маршрут';
    }
  }
}
