import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { group_list } from 'src/stat/entities/group_list.entity';
import { apparatuses_by_groups } from 'src/stat/entities/apparatuses_by_groups.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { users } from 'src/stat/entities/users.entity';
import { Role } from 'src/constants/roles';
import { device_customization } from 'src/about-devices/entities/device_customization.etity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(apparatus)
    private apparatusList: Repository<apparatus>,

    @InjectRepository(group_list)
    private groupList: Repository<group_list>,
    @InjectRepository(apparatuses_by_groups)
    private apparatuses_by_groupsRepository: Repository<apparatuses_by_groups>,
    @InjectRepository(users)
    private usersRepository: Repository<users>,
    @InjectRepository(device_customization)
    private deviceCustomizationRepository: Repository<device_customization>,
  ) {}

  async groupQuick(user_id: number) {
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

    const allGroup = await this.groupList.find({
      where: {
        user_id: Number(user_id),
      },
    });

    const groupApparat = await Promise.all(
      allGroup.map(async (item) => {
        const list = await this.apparatuses_by_groupsRepository.find({
          where: {
            group_id: item.id,
          },
        });

        return {
          ...item,
          apparatus: {
            list: list,
            length: list.length,
          },
        };
      }),
    );

    const allApparatus = await (async () => {
      if (currentUser.role === 'SUPER_ADMIN') {
        const apparatusList = await this.apparatusList.find();
        return await Promise.all(
          apparatusList.map(async (item) => {
            const name = await this.deviceCustomizationRepository.findOne({
              where: {
                user_id: Number(user_id),
                apparatus_id: item.id,
              },
            });

            return {
              ...item,
              name: name ? name.name : null,
            };
          }),
        );
      } else {
        const apparatusList = await this.apparatusList.find({
          where: { user_id: Number(user_id) },
        });
        return await Promise.all(
          apparatusList.map(async (item) => {
            const name = await this.deviceCustomizationRepository.findOne({
              where: {
                user_id: Number(user_id),
                apparatus_id: item.id,
              },
            });

            return {
              ...item,
              name: name ? name.name : null,
            };
          }),
        );
      }
    })();

    return {
      allGroup: groupApparat,
      allApparatus: allApparatus.sort((a, b) =>
        a.serial_number.localeCompare(b.serial_number),
      ),
    };
  }

  async groupDevice(group_name: string, user_id: number) {
    const groupOne = await this.groupList.findOne({
      where: {
        group_name: group_name,
        user_id: user_id,
      },
    });

    if (!groupOne) {
      return {
        code: 404,
        message: 'not found group',
      };
    }

    const listAppratusesGroup = await this.apparatuses_by_groupsRepository.find(
      {
        where: {
          group_id: groupOne.id,
        },
      },
    );

    return await Promise.all(
      listAppratusesGroup.map((item) => {
        return this.apparatusList.findOne({
          where: {
            id: item.apparatus_id,
          },
        });
      }),
    );
  }

  async groupDevicePut(
    group_name: string,
    update_name: string,
    user_id: number,
    update_apparatuses: number[],
  ) {
    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    if (!currentUser) {
      return {
        code: 404,
        message: 'not found user',
      };
    }

    const checkGroup = await (async () => {
      if (currentUser.role !== Role.SUPER_ADMIN) {
        return await this.groupList.findOne({
          where: {
            group_name: group_name,
            user_id: user_id,
          },
        });
      } else {
        return await this.groupList.findOne({
          where: {
            group_name: group_name,
          },
        });
      }
    })();

    if (!checkGroup) {
      return {
        code: 404,
        message: 'not found group',
      };
    }

    await this.groupList.update(
      { id: checkGroup.id },
      { group_name: update_name },
    );

    const apparatusesId = await this.apparatuses_by_groupsRepository.find({
      where: {
        group_id: checkGroup.id,
      },
    });
    await Promise.all(
      apparatusesId.map(async (item) => {
        await this.apparatuses_by_groupsRepository.delete({ id: item.id });
      }),
    );

    await Promise.all(
      update_apparatuses.map(async (item) => {
        await this.apparatuses_by_groupsRepository.save(
          this.apparatuses_by_groupsRepository.create({
            group_id: checkGroup.id,
            apparatus_id: item,
          }),
        );
      }),
    );

    return {
      code: 200,
      message: 'ok',
    };
  }

  async groupDevicePost(
    user_id: number,
    group_name: string,
    apparatus: [id: number],
  ) {
    const checkGroup = await this.groupList.findOne({
      where: {
        group_name: group_name,
      },
    });

    if (checkGroup) {
      return {
        code: 409,
        message: 'this group exists',
      };
    }

    const newGroupList = await this.groupList.save(
      this.groupList.create({ user_id: user_id, group_name: group_name }),
    );

    await Promise.all(
      apparatus.map(async (item) => {
        await this.apparatuses_by_groupsRepository.save(
          this.apparatuses_by_groupsRepository.create({
            group_id: newGroupList.id,
            apparatus_id: item,
          }),
        );
      }),
    );

    return { code: 201, newGroupList };
  }

  async groupDeviceDelete(group_name: string, user_id: number) {
    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    if (!currentUser) {
      return {
        code: 404,
        message: 'not found group',
      };
    }

    const checkGroup = await (async () => {
      if (currentUser.role !== Role.SUPER_ADMIN) {
        return await this.groupList.findOne({
          where: {
            group_name: group_name,
            user_id: user_id,
          },
        });
      } else {
        return await this.groupList.findOne({
          where: {
            group_name: group_name,
          },
        });
      }
    })();

    if (!checkGroup) {
      return {
        code: 404,
        message: 'not found group',
      };
    }

    await this.groupList.delete({ id: checkGroup.id });
    const apparatusesId = await this.apparatuses_by_groupsRepository.find({
      where: {
        group_id: checkGroup.id,
      },
    });
    await Promise.all(
      apparatusesId.map(async (item) => {
        await this.apparatuses_by_groupsRepository.delete({ id: item.id });
      }),
    );
    return {
      code: 200,
      message: 'ok',
    };
  }
}
