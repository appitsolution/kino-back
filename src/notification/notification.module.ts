import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { notification } from 'src/stat/entities/notification.entity';
import { users } from 'src/stat/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([notification, users])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
