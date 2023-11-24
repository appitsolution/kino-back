import { Injectable } from '@nestjs/common';
import { CreateStatusDeviceDto } from './dto/create-status-device.dto';
import { UpdateStatusDeviceDto } from './dto/update-status-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { reservedPortions } from 'src/stat/entities/reserved_portions.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { group_list } from 'src/stat/entities/group_list.entity';
import { error } from 'src/stat/entities/error.entity';
import { device_customization } from 'src/about-devices/entities/device_customization.etity';
import { language_location } from 'src/about-devices/entities/language_location.entity';
import { owners } from 'src/stat/entities/owner.entity';
import { users } from 'src/stat/entities/users.entity';
import { cleaning } from 'src/stat/entities/cleaning.entity';
import { popcorn_level } from 'src/stat/entities/popcorn_level.entity';
import { Role } from 'src/constants/roles';
import { actual_popcorn_lvl } from 'src/stat/entities/actual_popcorn_lvl.entity';
import { users_connect } from 'src/stat/entities/users_connect';

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
}

@Injectable()
export class StatusDevicesService {
  constructor(
    @InjectRepository(reservedPortions)
    private readonly reservedPortionsRepository: Repository<reservedPortions>,
    @InjectRepository(apparatus)
    private readonly apparatusRepository: Repository<apparatus>,
    @InjectRepository(group_list)
    private readonly groupListRepository: Repository<group_list>,
    @InjectRepository(error)
    private readonly errorRepository: Repository<error>,
    @InjectRepository(device_customization)
    private readonly device_customizationRepository: Repository<device_customization>,
    @InjectRepository(language_location)
    private readonly language_locationRepository: Repository<language_location>,
    @InjectRepository(owners)
    private readonly ownerRepository: Repository<owners>,
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    @InjectRepository(cleaning)
    private readonly cleaningRepository: Repository<cleaning>,
    @InjectRepository(popcorn_level)
    private readonly popcorn_levelRepository: Repository<popcorn_level>,
    @InjectRepository(actual_popcorn_lvl)
    private readonly actual_popcorn_lvlRepository: Repository<actual_popcorn_lvl>,
    @InjectRepository(users_connect)
    private readonly usersConnectRepository: Repository<users_connect>,
  ) {}

  async statusDevicesQuick(user_id: number, lang: string) {
    if (user_id === undefined) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const currentUser = await this.usersRepository.findOne({
      where: {
        id: Number(user_id),
      },
    });

    if (!currentUser) {
      return {
        code: 404,
        message: 'not found user',
      };
    }

    const apparatusUser = await (async () => {
      if (currentUser.role === Role.SUPER_ADMIN) {
        return await this.apparatusRepository.find({
          where: {
            type_id: 1,
          },
        });
      } else {
        const users = await this.apparatusRepository.find({
          where: {
            user_id: Number(user_id),
            type_id: 1,
          },
        });

        const dealers = await this.apparatusRepository.find({
          where: {
            dealer_id: Number(user_id),
            type_id: 1,
          },
        });

        const operators = await this.apparatusRepository.find({
          where: {
            operator_id: Number(user_id),
            type_id: 1,
          },
        });

        const adminsOrManagerRequest = await this.usersConnectRepository.find({
          where: {
            user_id_s: Number(user_id),
          },
        });

        const admins = await Promise.all(
          adminsOrManagerRequest.map(async (item) => {
            const apparatusAdminOrManager = await this.apparatusRepository.find(
              {
                where: {
                  user_id: item.user_id,
                  type_id: 1,
                },
              },
            );
            return apparatusAdminOrManager;
          }),
        );

        const manager = await Promise.all(
          adminsOrManagerRequest.map(async (item) => {
            const managerRequest = await this.usersConnectRepository.find({
              where: {
                user_id_s: item.user_id,
              },
            });

            return await Promise.all(
              managerRequest.map(async (checkItem) => {
                const apparatusAdminOrManager =
                  await this.apparatusRepository.find({
                    where: {
                      user_id: checkItem.user_id,
                      type_id: 1,
                    },
                  });
                return apparatusAdminOrManager;
              }),
            );
          }),
        );

        if (currentUser.role === Role.DEALER) {
          return dealers;
        }

        // if (currentUser.role === Role.OPERATOR) {
        //   return operators;
        // }

        // if(currentUser.role === Role.ADMIN){
        //   return admins
        // }

        const allApparatusList = [
          ...users,
          ...dealers,
          ...operators,
          ...admins.flat(),
          ...manager.flat(2),
        ];
        const newAllApparatusList = [];

        allApparatusList.forEach((item) => {
          if (newAllApparatusList.find((fin) => fin.id === item.id)) {
            return;
          } else {
            return newAllApparatusList.push(item);
          }
        });

        return newAllApparatusList;
      }
    })();

    const result = await Promise.all(
      apparatusUser.map(async (item) => {
        const name = await this.device_customizationRepository.findOne({
          where: { user_id: user_id, apparatus_id: item.id },
        });

        const location = await this.language_locationRepository.findOne({
          where: {
            language: lang,
            apparatus_id: item.id,
          },
        });

        return {
          name: name ? name.name : null,
          location: location ? location.translation : '',
          serial_number: item.serial_number,
        };
      }),
    );

    return {
      code: 200,
      result,
    };
  }

  async statusDevicesDevice(serial_number: string, lang: string) {
    if (!serial_number) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    // INFO
    const currentApparat = await this.apparatusRepository.findOne({
      where: {
        serial_number: serial_number,
        type_id: 1,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'not found serial_number',
      };
    }
    const nameApparat = await this.device_customizationRepository.findOne({
      where: {
        apparatus_id: currentApparat.id,
      },
    });
    const locationApparat = await this.language_locationRepository.findOne({
      where: {
        apparatus_id: currentApparat.id,
        language: lang,
      },
    });
    const ownerApparat = await this.ownerRepository.findOne({
      where: {
        id: currentApparat.owners_id,
      },
    });
    const userApparat = await this.usersRepository.findOne({
      where: {
        id: currentApparat.user_id,
      },
    });
    const shipmentDataApparat = currentApparat.shipment_date;
    const commissioningDataApparat = currentApparat.commissioning_date;

    const allSellApparat = await this.reservedPortionsRepository.find({
      where: {
        serial_number: currentApparat.serial_number,
      },
    });

    const lastError = await this.errorRepository.query(
      'SELECT * FROM error WHERE serial_number = ? ORDER BY id DESC LIMIT 5;',
      [serial_number],
    );

    const lastClear = await this.cleaningRepository.query(
      'SELECT * FROM cleaning WHERE serial_number = ? ORDER BY id DESC LIMIT 5;',
      [serial_number],
    );

    const lastFill = await this.popcorn_levelRepository.query(
      'SELECT * FROM popcorn_level WHERE serial_number = ? ORDER BY id DESC LIMIT 5;',
      [serial_number],
    );

    const actualLevel = await this.actual_popcorn_lvlRepository.findOne({
      where: {
        serial_number: serial_number,
      },
    });

    return {
      name: nameApparat.name,
      location: locationApparat ? locationApparat.translation : '',
      serial_number: currentApparat.serial_number,
      lastError: lastError ? lastError : [],
      lastClear: lastClear ? lastClear : [],
      lastFill: lastFill ? lastFill : [],
      actualLevel: actualLevel ? actualLevel.actual_lvl : 0,
      there_is_a_stock: actualLevel ? actualLevel.there_is_a_stock : false,
    };
  }

  async statusDevicesCleaning(serial_number: string, user_id: number) {
    if (!serial_number || user_id === undefined) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const result = await this.cleaningRepository.save(
      this.cleaningRepository.create({
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        user_id: Number(user_id),
        serial_number: serial_number,
      }),
    );

    return {
      code: 200,
      result,
    };
  }

  async statusDevicesLoading(
    serial_number: string,
    user_id: number,
    level: number,
  ) {
    if (!serial_number || user_id === undefined || level === undefined) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const result = await this.popcorn_levelRepository.save(
      this.popcorn_levelRepository.create({
        date: getCurrentDateTime().date,
        time: getCurrentDateTime().time,
        user_id: Number(user_id),
        serial_number: serial_number,
        level: Number(level),
      }),
    );

    return {
      code: 200,
      result,
    };
  }
}
