import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiQuery({ name: 'user_id', required: true })
  @ApiQuery({ name: 'token', required: true })
  @Post('register')
  registerToken(@Query() args: { user_id: number; token: string }) {
    return this.notificationService.registerToken(args.user_id, args.token);
  }

  @ApiQuery({ name: 'user_id', required: true })
  @ApiQuery({ name: 'title', required: true })
  @ApiQuery({ name: 'body', required: true })
  @Get('send')
  sendNotification(
    @Query() args: { user_id: number; title: string; body: string },
  ) {
    return this.notificationService.sendNotification(
      args.user_id,
      args.title,
      args.body,
    );
  }
}
