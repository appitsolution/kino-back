// roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
const jwt = require('jsonwebtoken');

interface User {
  username: string;
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly secretKey = '345gsd#fdfgsd';
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    const cleanToken = token.replace('Bearer ', '');
    const decodedToken = jwt.decode(cleanToken, this.secretKey);

    return requiredRoles.includes(decodedToken.role);
  }
}
