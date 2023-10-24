// guard.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GuardService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    // Проверка логина и пароля пользователя
    // ...

    // Если пользователь аутентифицирован, создайте и верните JWT-токен
    const payload = {
      username: user.username,
      sub: user.userId,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
