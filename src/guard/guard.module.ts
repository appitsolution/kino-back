// guard.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GuardService } from './guard.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: '345gsd#fdfgsd', // Замените на ваш секретный ключ
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [GuardService, JwtStrategy],
  exports: [PassportModule, GuardService],
})
export class GuardModule {}
