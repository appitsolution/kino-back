import { Module } from '@nestjs/common';
import { AdmininstrationService } from './admininstration.service';
import { AdmininstrationController } from './admininstration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admininstration } from './entities/admininstration.entity';
import { users } from 'src/stat/entities/users.entity';
import { owners } from 'src/stat/entities/owner.entity';
import { users_connect } from 'src/stat/entities/users_connect';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admininstration, users, owners, users_connect]),
  ],
  controllers: [AdmininstrationController],
  providers: [AdmininstrationService],
})
export class AdmininstrationModule {}
