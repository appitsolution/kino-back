import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { notification } from 'src/stat/entities/notification.entity';
import { users } from 'src/stat/entities/users.entity';
import { sendNotification } from 'src/utils/send-notification';

@Injectable()
export class NotificationService {
  @InjectRepository(notification)
  private readonly notificationRepository: Repository<notification>;
  @InjectRepository(users)
  private readonly usersRepository: Repository<users>;

  async registerToken(user_id: number, token: string) {
    console.log(token);
    try {
      if (user_id === undefined || !token) {
        return {
          code: 400,
          message: 'not such arguments',
        };
      }

      const currentUser = await this.usersRepository.findOne({
        where: {
          id: user_id,
        },
      });

      if (!currentUser) {
        return {
          code: 404,
          message: 'user not found ',
        };
      }

      const check = await this.notificationRepository.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (check) {
        const result = await this.notificationRepository.update(
          { id: check.id },
          {
            user_id: user_id,
            token: token,
          },
        );
        return {
          code: 201,
          result,
        };
      } else {
        const result = await this.notificationRepository.save(
          this.notificationRepository.create({
            user_id: user_id,
            token: token,
          }),
        );
        return {
          code: 201,
          result,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        code: 500,
      };
    }
  }

  async deleteToken(user_id: number) {
    try {
      if (user_id === undefined) {
        return {
          code: 400,
          message: 'not such arguments',
        };
      }

      const currentUser = await this.usersRepository.findOne({
        where: {
          id: user_id,
        },
      });

      if (!currentUser) {
        return {
          code: 404,
          message: 'user not found ',
        };
      }

      const check = await this.notificationRepository.findOne({
        where: {
          user_id: user_id,
        },
      });

      if (check) {
        const result = await this.notificationRepository.delete({
          id: check.id,
        });
        return {
          code: 201,
          result,
        };
      } else {
        return {
          code: 404,
          message: 'not found',
        };
      }
    } catch (err) {
      console.log(err);
      return {
        code: 500,
      };
    }
  }

  async sendNotification(user_id: number, title: string, body: string) {
    if (user_id === undefined || !title || !body) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }
    const currentUser = await this.notificationRepository.findOne({
      where: {
        user_id: user_id,
      },
    });

    if (!currentUser) {
      return {
        code: 404,
        message: 'user not found ',
      };
    }

    await sendNotification(currentUser.token, title, body);

    return {
      code: 200,
      body: 'send',
    };
  }
}
