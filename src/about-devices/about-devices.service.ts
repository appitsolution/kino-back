import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { group_listDevices } from './entities/group_list.entity';
import { errorDevices } from './entities/error.entity';
import { device_customization } from './entities/device_customization.etity';
import { language_location } from './entities/language_location.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { owners } from 'src/stat/entities/owner.entity';
import { users } from 'src/stat/entities/users.entity';
import { reservedPortions } from 'src/stat/entities/reserved_portions.entity';
import { modules_of_device } from 'src/stat/entities/modules_of_device.entity';
import { language_module_list } from 'src/stat/entities/language_module_list.entity';
import { language_module_type_list } from 'src/stat/entities/language_module_type_list.entity';
import { language_service_maintenance } from 'src/stat/entities/language_service_maintenance.entity';
import { service_maintenance_of_device } from 'src/stat/entities/service_maintenance_of_device.entity';
import { update_task } from 'src/stat/entities/update_task.entity';
import { Role } from 'src/constants/roles';
import { UpdateComplectationAboutDeviceDto } from './dto/update-complectation-about-device.dto';
import { module_type_list } from 'src/stat/entities/module_type_list.entity';

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
export class AboutDevicesService {
  constructor(
    @InjectRepository(reservedPortions)
    private readonly reservedPortionsRepository: Repository<reservedPortions>,
    @InjectRepository(apparatus)
    private readonly apparatusRepository: Repository<apparatus>,
    @InjectRepository(group_listDevices)
    private readonly groupListRepository: Repository<group_listDevices>,
    @InjectRepository(errorDevices)
    private readonly errorRepository: Repository<errorDevices>,
    @InjectRepository(device_customization)
    private readonly device_customizationRepository: Repository<device_customization>,
    @InjectRepository(language_location)
    private readonly language_locationRepository: Repository<language_location>,
    @InjectRepository(owners)
    private readonly ownerRepository: Repository<owners>,
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,

    @InjectRepository(modules_of_device)
    private readonly modules_of_deviceRepository: Repository<modules_of_device>,
    @InjectRepository(language_module_list)
    private readonly language_module_listRepository: Repository<language_module_list>,
    @InjectRepository(language_module_type_list)
    private readonly language_module_type_listRepository: Repository<language_module_type_list>,
    @InjectRepository(language_service_maintenance)
    private readonly language_service_maintenanceRepository: Repository<language_service_maintenance>,
    @InjectRepository(service_maintenance_of_device)
    private readonly service_maintenance_of_deviceRepository: Repository<service_maintenance_of_device>,
    @InjectRepository(update_task)
    private readonly update_taskRepository: Repository<update_task>,
    @InjectRepository(module_type_list)
    private readonly module_type_listRepository: Repository<module_type_list>,
  ) {}

  async devicesQuick(user_id: number, lang: string) {
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
        return await this.apparatusRepository.find();
      } else {
        return await this.apparatusRepository.find({
          where: {
            user_id: Number(user_id),
          },
        });
      }
    })();

    const allDeviceCustomization =
      await this.device_customizationRepository.find();

    const allLangLocation = await this.language_locationRepository.find({
      where: {
        language: lang,
      },
    });

    if (allLangLocation.length === 0) {
      return {
        code: 404,
        message: 'not found lang',
      };
    }

    const result = apparatusUser.map((item) => {
      const name = allDeviceCustomization.find(
        (dev) => dev.apparatus_id === item.id,
      );

      const location = allLangLocation.find(
        (loc) => loc.apparatus_id === item.id,
      );

      return {
        name: name.name,
        location: location.translation,
        serial_number: item.serial_number,
      };
    });

    return result;
  }

  async aboutDevicesGet(serial_number: string, user_id: number, lang: string) {
    if (!serial_number || !lang || user_id === undefined) {
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

    // if (!currentUser) {
    //   return {
    //     code: 404,
    //     message: 'not found user',
    //   };
    // }

    // INFO
    const currentApparat = await this.apparatusRepository.findOne({
      where: {
        serial_number: serial_number,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    const nameApparat = await this.device_customizationRepository.findOne({
      where: {
        apparatus_id: currentApparat.id,
        // user_id: Number(user_id),
      },
    });

    if (!nameApparat) {
      return {
        code: 404,
        message: 'name aparat not found',
      };
    }

    const locationApparat = await this.language_locationRepository.findOne({
      where: {
        apparatus_id: currentApparat.id,
      },
    });

    if (!locationApparat) {
      return {
        code: 404,
        message: 'location aparat not found',
      };
    }

    const ownerApparat = await this.ownerRepository.findOne({
      where: {
        id: currentApparat.owners_id,
      },
    });

    if (!ownerApparat) {
      return {
        code: 404,
        message: 'owner aparat not found',
      };
    }

    const userApparat = await this.usersRepository.findOne({
      where: {
        id: currentApparat.user_id,
      },
    });

    const dealerApparat = await this.usersRepository.findOne({
      where: {
        id: currentApparat.dealer_id,
      },
    });

    const operatorApparat = await this.usersRepository.findOne({
      where: {
        id: currentApparat.operator_id,
      },
    });

    // if (!userApparat) {
    //   return {
    //     code: 404,
    //     message: 'user aparat not found',
    //   };
    // }

    const shipmentDataApparat = currentApparat.shipment_date;
    const commissioningDataApparat = currentApparat.commissioning_date;

    const allSellApparat = await this.reservedPortionsRepository.find({
      where: {
        serial_number: currentApparat.serial_number,
      },
    });

    // Complectation

    const modulesDevice = await this.modules_of_deviceRepository.find({
      where: { apparatus_id: currentApparat.id },
    });
    const modulesDeviceTitles = await Promise.all(
      modulesDevice.map(async (item) => {
        const title = await this.language_module_listRepository.findOne({
          where: { module_id: item.components_id, language: lang },
        });

        const value = await this.language_module_type_listRepository.findOne({
          where: { module_type_id: item.component_type_id, language: lang },
        });

        const module_type_id_current =
          await this.module_type_listRepository.findOne({
            where: {
              id: item.component_type_id,
            },
          });

        const variant = await this.module_type_listRepository.find({
          where: {
            components_id: module_type_id_current.components_id,
          },
        });

        const variantLang = await Promise.all(
          variant.map(async (item) => {
            const variantLangCurrent =
              await this.language_module_type_listRepository.findOne({
                where: {
                  module_type_id: item.id,
                  language: lang,
                },
              });

            return {
              id: item.id,
              // module_type_id: variantLangCurrent.id,

              component_type: variantLangCurrent.translation,
            };
          }),
        );

        return {
          variant: variantLang,
          id: item.id,
          apparatus_id: item.apparatus_id,
          title: {
            id: title.id,
            title: title.translation,
          },
          value: {
            id: value.module_type_id,
            value: value.translation,
          },
          lang: lang,
        };
      }),
    );

    // SERVICE

    const serviceDeviceMaintenance =
      await this.service_maintenance_of_deviceRepository.find({
        where: { apparatus_id: currentApparat.id },
      });

    const serviceDeviceMaintenanceTitle = await Promise.all(
      serviceDeviceMaintenance.map(async (item) => {
        const title = await this.language_service_maintenanceRepository.findOne(
          {
            where: {
              maintenance_id: item.maintenance_id,
              language: lang,
            },
          },
        );

        if (!title) return null;
        return {
          title: {
            id: title.id,
            title: title.translation,
          },
          value: {
            id: item.id,
            value: item.value,
          },
          lang: lang,
        };
      }),
    );

    return {
      code: 200,
      information: {
        name: nameApparat.name ? nameApparat.name : '',
        location: locationApparat.translation
          ? locationApparat.translation
          : '',
        owner: ownerApparat.owner,
        user: userApparat.username ? userApparat.username : null,
        dealer: dealerApparat.username ? dealerApparat.username : null,
        operator: operatorApparat.username ? operatorApparat.username : null,
        shipment_date: shipmentDataApparat,
        commissioning_date: commissioningDataApparat,
        number_score: currentApparat.number_score
          ? currentApparat.number_score
          : '',
        number_act: currentApparat.number_act ? currentApparat.number_act : '',
        all_sell: allSellApparat.reduce(
          (acc, current) => current.portions + acc,
          0,
        ),
      },
      complectation: modulesDeviceTitles,
      service: serviceDeviceMaintenanceTitle.filter((item) => item !== null),
    };
  }

  async aboutDevicesPutInformataion(
    serial_number: string,
    user_id: number,
    updateData: any,
  ) {
    if (!serial_number || !updateData) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const currentApparat = await this.apparatusRepository.findOne({
      where: {
        serial_number: serial_number,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    let updateInfo = false;
    if (updateData.hasOwnProperty('name')) {
      await this.device_customizationRepository.update(
        {
          apparatus_id: currentApparat.id,
          user_id: Number(user_id),
        },
        { name: updateData.name },
      );
      updateInfo = true;
    }
    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    if (currentUser.role === Role.CLIENT) {
      return {
        code: 200,
        message: 'information update',
      };
    }

    if (updateData.hasOwnProperty('location')) {
      await this.language_locationRepository.update(
        {
          apparatus_id: currentApparat.id,
          language: updateData.lang,
        },
        { translation: updateData.location },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('owner')) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { owners_id: updateData.owner },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('user')) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { user_id: updateData.user },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('dealer')) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { dealer_id: updateData.dealer },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('operator')) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { operator_id: updateData.operator },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('serial_number')) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { serial_number: updateData.serial_number },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('number_score')) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { number_score: updateData.number_score },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('number_act')) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { number_act: updateData.number_act },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('shipment_date')) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { shipment_date: updateData.shipment_date },
      );
      updateInfo = true;
    }

    if (updateData.hasOwnProperty('commissioning_date')) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { commissioning_date: updateData.commissioning_date },
      );
      updateInfo = true;
    }

    if (updateInfo) {
      return {
        code: 200,
        message: 'information update',
      };
    } else {
      return {
        code: 404,
        message: 'updateData is not correct',
      };
    }
  }

  async aboutDevicesPutComplectation(
    serial_number: string,
    user_id: number,
    updateData: [UpdateComplectationAboutDeviceDto],
  ) {
    if (!serial_number || user_id === undefined || !updateData) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const currentApparat = await this.apparatusRepository.findOne({
      where: {
        serial_number: serial_number,
        user_id: user_id,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    try {
      await Promise.all(
        updateData.map(async (item) => {
          await this.modules_of_deviceRepository.update(
            {
              id: item.id,
              apparatus_id: item.apparatus_id,
            },
            {
              component_type_id: item.new_component_type_id,
            },
          );
        }),
      );

      return {
        code: 200,
        message: 'complectation update',
      };
    } catch (err) {
      return {
        code: 500,
        message: 'error',
      };
    }
  }

  async aboutDevicesPutService(
    serial_number: string,
    user_id: number,
    updateData: any,
  ) {
    if (!serial_number || user_id === undefined) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const currentApparat = await this.apparatusRepository.findOne({
      where: {
        serial_number: serial_number,
        user_id: user_id,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    if (!Array.isArray(updateData)) {
      return {
        code: 400,
        message: 'data is not correct',
      };
    }

    try {
      await Promise.all(
        updateData.map(async (item) => {
          await this.service_maintenance_of_deviceRepository.update(
            {
              id: item.id,
            },
            { value: item.newValue },
          );
        }),
      );
      return {
        code: 200,
        message: 'service update',
      };
    } catch (err) {
      return err;
    }
  }

  async aboutDevicesUpdateTask(serial_number: string, value: string) {
    if (!serial_number || !value) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const updateTask = await this.update_taskRepository.save(
      this.update_taskRepository.create({
        apparatus: serial_number,
        applied: 0,
        time: getCurrentDateTime().time,
        date: getCurrentDateTime().date,
        value: value,
      }),
    );

    return { code: 201, updateTask };
  }
}
