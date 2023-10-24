import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { users } from 'src/stat/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, users])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
