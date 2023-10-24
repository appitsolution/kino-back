import { Injectable } from '@nestjs/common';
import { CreateStatDto } from './dto/create-stat.dto';
import { UpdateStatDto } from './dto/update-stat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { reservedPortions } from './entities/reserved_portions.entity';
import { error } from './entities/error.entity';
import { apparatus } from './entities/apparatus.entity';
import { group_list } from './entities/group_list.entity';
import { users } from './entities/users.entity';
import { Role } from 'src/constants/roles';
import { apparatuses_by_groups } from './entities/apparatuses_by_groups.entity';
import { device_customization } from 'src/about-devices/entities/device_customization.etity';

function parseDateToCustomFormat(inputDate) {
  const date = new Date(inputDate);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  return `${year}-${month}-${day}`;
}

function getDate(interval: string, customDate: string) {
  const currentDate = customDate ? new Date(customDate) : new Date();
  let endDate = new Date(currentDate);

  if (interval === 'day') {
    endDate.setDate(currentDate.getDate() + 1);
  } else if (interval === 'week') {
    const dayOfWeek = currentDate.getDay();
    const daysUntilMonday = (7 - dayOfWeek) % 7;
    endDate.setDate(currentDate.getDate() + daysUntilMonday);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    return [
      parseDateToCustomFormat(startDate),
      parseDateToCustomFormat(endDate),
    ];
  } else if (interval === 'month') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0);
    endDate.setDate(endDate.getDate() + 1);
    return [
      parseDateToCustomFormat(startDate),
      parseDateToCustomFormat(endDate),
    ];
  } else if (interval === 'year') {
    const year = currentDate.getFullYear();
    const startDate = new Date(year, 0, 1); // Первый день текущего года
    endDate = new Date(year + 1, 0, 0); // Последний день текущего года
    endDate.setDate(endDate.getDate() + 1);
    return [
      parseDateToCustomFormat(startDate),
      parseDateToCustomFormat(endDate),
    ];
  } else {
    return [
      parseDateToCustomFormat(currentDate),
      parseDateToCustomFormat(currentDate),
    ];
  }

  return [
    parseDateToCustomFormat(currentDate),
    parseDateToCustomFormat(endDate),
  ];
}

@Injectable()
export class StatService {
  constructor(
    @InjectRepository(reservedPortions)
    private readonly reservedPortionsRepository: Repository<reservedPortions>,
    @InjectRepository(apparatus)
    private readonly apparatusRepository: Repository<apparatus>,
    @InjectRepository(group_list)
    private readonly groupListRepository: Repository<group_list>,
    @InjectRepository(apparatuses_by_groups)
    private readonly apparatuses_by_groupsRepository: Repository<apparatuses_by_groups>,
    @InjectRepository(error)
    private readonly errorRepository: Repository<error>,
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    @InjectRepository(device_customization)
    private readonly udeviceCustomizationRepository: Repository<device_customization>,
  ) {}

  async statStart(user_id: number) {
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

    if (currentUser.role === Role.SUPER_ADMIN) {
      const lastMonthStartDate = new Date();
      lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);

      const allPortions = await this.reservedPortionsRepository.query(
        'SELECT * FROM reserved_portions WHERE date >= ?',
        [lastMonthStartDate],
      );
      const allErrors = await this.errorRepository.query(
        'SELECT * FROM error WHERE date >= ?',
        [lastMonthStartDate],
      );

      const allGroups = await this.groupListRepository.find({
        where: { user_id },
      });

      const allApparatus = await this.apparatusRepository.find({});
      const allApparatusName = await Promise.all(
        allApparatus.map(async (item) => {
          try {
            const name = await this.udeviceCustomizationRepository.findOne({
              where: { apparatus_id: item.id, user_id: user_id },
            });

            return {
              ...item,
              name: name.name,
            };
          } catch (err) {
            return {
              ...item,
              name: null,
            };
          }
        }),
      );

      return {
        apparatus: allApparatusName,
        errors: allErrors.length,
        groups: allGroups,
        portions: allPortions.reduce(
          (acc, current) => acc + current.portions,
          0,
        ),
        sell: allPortions.reduce((acc, current) => acc + current.price, 0),
      };
    } else {
      const lastMonthStartDate = new Date();
      lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);

      const allApparatus = await this.apparatusRepository.find({
        where: { user_id },
      });

      const allApparatusName = await Promise.all(
        allApparatus.map(async (item) => {
          try {
            const name = await this.udeviceCustomizationRepository.findOne({
              where: { apparatus_id: item.id, user_id: user_id },
            });

            return {
              ...item,
              name: name.name,
            };
          } catch (err) {
            return {
              ...item,
              name: null,
            };
          }
        }),
      );

      const allSerialNumber = allApparatus.map((item) => item.serial_number);

      const allPortions = await this.reservedPortionsRepository.query(
        'SELECT * FROM reserved_portions WHERE date >= ?',
        [lastMonthStartDate],
      );

      const userPortions = allPortions.filter((item) => {
        return allSerialNumber.some((serial) => {
          if (serial === item.serial_number) {
            return true;
          }
        });
      });

      const allErrors = await this.errorRepository.query(
        'SELECT * FROM error WHERE date >= ?',
        [lastMonthStartDate],
      );

      const userErrors = allErrors.filter((item) => {
        if (allSerialNumber.includes(item.serial_number)) {
          return item;
        }
      });

      const allGroups = await this.groupListRepository.find({
        where: { user_id },
      });

      return {
        apparatus: allApparatusName,
        errors: userErrors.length,
        groups: allGroups,
        portions: userPortions.reduce(
          (acc, current) => acc + current.portions,
          0,
        ),
        sell: userPortions.reduce((acc, current) => acc + current.price, 0),
      };
    }
  }

  async statQuick(
    serial_number: string,
    group_name: string,
    user_id: number,
    date: string,
  ) {
    if (!date) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    if (!group_name) {
      const allPortions = await this.reservedPortionsRepository.query(
        'SELECT * FROM reserved_portions WHERE date = ? AND serial_number = ?',
        [date, serial_number],
      );
      const allErrors = await this.errorRepository.query(
        'SELECT * FROM error WHERE date = ? AND serial_number = ?',
        [date, serial_number],
      );

      return {
        errors: allErrors.length,
        portions: allPortions.reduce(
          (acc, current) => acc + current.portions,
          0,
        ),
        sell: allPortions.reduce((acc, current) => acc + current.price, 0),
      };
    } else {
      const currentGroup = await this.groupListRepository.findOne({
        where: {
          group_name: group_name,
          user_id: user_id,
        },
      });

      if (!currentGroup) {
        return {
          code: 404,
          message: 'not found group',
        };
      }

      const listAparatus = await this.apparatuses_by_groupsRepository.find({
        where: {
          group_id: currentGroup.id,
        },
      });

      const serialNumberList = await Promise.all(
        listAparatus.map(async (item) => {
          return await this.apparatusRepository.findOne({
            where: {
              id: item.apparatus_id,
            },
          });
        }),
      );

      const allPortions = await Promise.all(
        serialNumberList.map(async (item) => {
          return await this.reservedPortionsRepository.find({
            where: {
              serial_number: item.serial_number,
              date: date,
            },
          });
        }),
      );
      const allErrors = await Promise.all(
        serialNumberList.map(async (item) => {
          return await this.errorRepository.find({
            where: {
              serial_number: item.serial_number,
              date: date,
            },
          });
        }),
      );

      return {
        errors: allErrors.flat().length,
        portions: allPortions
          .flat()
          .reduce((acc, current) => acc + current.portions, 0),
        sell: allPortions
          .flat()
          .reduce((acc, current) => acc + current.price, 0),
      };
    }
  }

  async statAll(
    serial_number: string,
    group_name: string,
    date: string,
    user_id: number,
    typeOfData: string,
    interval: string = 'day',
  ) {
    if (!date || user_id === undefined || !typeOfData) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    if (typeOfData === 'error') {
      if (!group_name) {
        const [startDate, endDate] = getDate(interval, date);
        return await this.errorRepository.query(
          'SELECT * FROM error WHERE date BETWEEN ? AND ? AND serial_number = ?',
          [startDate, endDate, serial_number],
        );
      } else {
        const currentGroup = await this.groupListRepository.findOne({
          where: {
            group_name: group_name,
            user_id: user_id,
          },
        });

        if (!currentGroup) {
          return {
            code: 404,
            message: 'not found group',
          };
        }

        const listAparatus = await this.apparatuses_by_groupsRepository.find({
          where: {
            group_id: currentGroup.id,
          },
        });

        const serialNumberList = await Promise.all(
          listAparatus.map(async (item) => {
            return await this.apparatusRepository.findOne({
              where: {
                id: item.apparatus_id,
              },
            });
          }),
        );
        const [startDate, endDate] = getDate(interval, date);
        const allErrors = await Promise.all(
          serialNumberList.map(async (item) => {
            return await this.errorRepository.find({
              where: {
                serial_number: item.serial_number,
                date: Between(startDate.toString(), endDate.toString()),
              },
            });
          }),
        );
        return allErrors.flat();
      }
    }

    if (typeOfData === 'sell') {
      if (!group_name) {
        const [startDate, endDate] = getDate(interval, date);
        return await this.reservedPortionsRepository.query(
          'SELECT * FROM reserved_portions WHERE date BETWEEN ? AND ? AND serial_number = ?',
          [startDate, endDate, serial_number],
        );
      } else {
        const currentGroup = await this.groupListRepository.findOne({
          where: {
            group_name: group_name,
            // user_id: user_id,
          },
        });

        if (!currentGroup) {
          return {
            code: 404,
            message: 'not found group',
          };
        }

        const listAparatus = await this.apparatuses_by_groupsRepository.find({
          where: {
            group_id: currentGroup.id,
          },
        });

        const serialNumberList = await Promise.all(
          listAparatus.map(async (item) => {
            return await this.apparatusRepository.findOne({
              where: {
                id: item.apparatus_id,
              },
            });
          }),
        );

        const [startDate, endDate] = getDate(interval, date);
        const allPortions = await Promise.all(
          serialNumberList.map(async (item) => {
            return await this.reservedPortionsRepository.find({
              where: {
                serial_number: item.serial_number,
                date: Between(startDate, endDate),
              },
            });
          }),
        );

        return allPortions.flat().map((item) => {
          return {
            ...item,
            date: item.date,
          };
        });
      }
    }

    return {
      code: 404,
      message: 'not found typeOfData',
    };
  }
}
