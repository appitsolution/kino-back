import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { users } from 'src/stat/entities/users.entity';
import { users_connect } from 'src/stat/entities/users_connect';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, users, users_connect])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
