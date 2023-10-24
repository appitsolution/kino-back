import { Injectable } from '@nestjs/common';
import { CreateErrorDto } from './dto/create-error.dto';
import { UpdateErrorDto } from './dto/update-error.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { error } from 'src/stat/entities/error.entity';
import { users } from 'src/stat/entities/users.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { sendNotification } from 'src/utils/send-notification';
import { notification } from 'src/stat/entities/notification.entity';
import { error_processed } from 'src/stat/entities/error_processed.entity';

@Injectable()
export class ErrorService {
  @InjectRepository(error)
  private readonly errorRepository: Repository<error>;
  @InjectRepository(users)
  private readonly usersRepository: Repository<users>;
  @InjectRepository(apparatus)
  private readonly apparatusRepository: Repository<apparatus>;
  @InjectRepository(notification)
  private readonly notificationRepository: Repository<notification>;
  @InjectRepository(error_processed)
  private readonly error_processedRepository: Repository<error_processed>;

  async startError() {
    const lastProcessedId = await this.error_processedRepository.findOne({
      where: {
        id: 1,
      },
    });
    return lastProcessedId.last_processed_id;
  }

  async checkLastError(serial_number: string, user_id: number) {
    if (!serial_number) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const newErrors = await this.errorRepository
      .createQueryBuilder('error')
      .where('error.serial_number = :serialNumber', {
        serialNumber: serial_number,
      })
      .getMany();

    const findErrors = newErrors.filter((item) => {
      const readJSON = JSON.parse(item.read).users;

      if (readJSON) {
        const checkError = readJSON.find((error) => {
          if (error.user_id === +user_id && !error.read) {
            return item;
          }
        });
        return checkError;
      } else {
        return;
      }
    });

    return {
      code: 200,
      findErrors,
    };
  }

  async readLastError(serial_number: string, user_id: number) {
    if (!serial_number) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const listError = await this.errorRepository.find({
      where: {
        serial_number: serial_number,
      },
    });

    const updateListError = listError.map((item) => {
      const readJSON = JSON.parse(item.read).users;
      if (readJSON) {
        const newReadJSON = readJSON.map((user) => {
          if (+user.user_id === +user_id) {
            return {
              ...user,
              read: true,
            };
          } else {
            return user;
          }
        });

        return {
          ...item,
          read: JSON.stringify({ users: newReadJSON }),
        };
      }

      return item;
    });

    await Promise.all(
      updateListError.map(async (item) => {
        await this.errorRepository.update({ id: item.id }, { read: item.read });
        return true;
      }),
    );

    return {
      code: 200,
    };
  }

  async pollForNewErrors() {
    try {
      const lastProcessedId = await this.error_processedRepository.findOne({
        where: {
          id: 1,
        },
      });
      const newErrors = await this.errorRepository
        .createQueryBuilder('error')
        .where('error.id > :lastProcessedId', {
          lastProcessedId: lastProcessedId.last_processed_id,
        })
        .getMany();

      newErrors.forEach(async (error) => {
        const currentAparats = await this.apparatusRepository.find({
          where: {
            serial_number: error.serial_number,
          },
        });

        await Promise.all(
          currentAparats.map(async (item) => {
            const token = await this.notificationRepository.findOne({
              where: {
                user_id: item.user_id,
              },
            });

            if (token) {
              await sendNotification(
                token.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
              );
            }
          }),
        );
      });

      if (newErrors.length > 0) {
        await this.error_processedRepository.update(
          { id: 1 },
          {
            last_processed_id: Math.max(...newErrors.map((error) => error.id)),
          },
        );
      }
    } catch (error) {
      console.error('Ошибка при опросе базы данных:', error);
    }
  }

  startPolling() {
    const pollingInterval = 300000;

    this.pollForNewErrors();

    setInterval(() => {
      this.pollForNewErrors();
    }, pollingInterval);
  }
}
