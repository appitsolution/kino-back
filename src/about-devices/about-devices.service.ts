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
import { module_list } from 'src/stat/entities/module_list.entity';
import { service_maintenance } from 'src/stat/entities/service_maintenance.entity';
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
    @InjectRepository(module_list)
    private readonly module_listRepository: Repository<module_list>,
    @InjectRepository(service_maintenance)
    private readonly service_maintenanceRepository: Repository<service_maintenance>,
    @InjectRepository(users_connect)
    private readonly usersConnectRepository: Repository<users_connect>,
  ) {}

  async devicesQuick(user_id: number, lang: string) {
    if (user_id === undefined || user_id === null) {
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

    const result = await Promise.all(
      apparatusUser.map(async (item) => {
        const name = await this.device_customizationRepository.findOne({
          where: {
            user_id: user_id,
            apparatus_id: item.id,
          },
        });

        const location = allLangLocation.find(
          (loc) => loc.apparatus_id === item.id,
        );

        return {
          id: item.id,
          name: name ? name.name : '',
          location: location ? location.translation : '',
          serial_number: item.serial_number,
        };
      }),
    );

    return result;
  }

  async aboutDevicesGet(serial_number: string, user_id: number, lang: string) {
    if (!serial_number || !lang || user_id === undefined || user_id === null) {
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
        type_id: 1,
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
        user_id: Number(user_id),
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

    // if (!ownerApparat) {
    //   return {
    //     code: 404,
    //     message: 'owner aparat not found',
    //   };
    // }

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

    const moduleListAll = await this.module_listRepository.find({
      where: {
        apparatus_type_id: 1,
      },
    });

    const prevResult = await Promise.all(
      moduleListAll.map(async (item) => {
        const title = await this.language_module_listRepository.findOne({
          where: {
            language: lang,
            module_id: item.id,
          },
        });

        const variant = await this.module_type_listRepository.find({
          where: { components_id: item.id },
        });

        return {
          title: {
            id: item.id,
            title: title.translation,
          },
          value: {
            id: null,
            value: null,
          },
          variant: variant,
          lang: lang,
        };
      }),
    );

    const result = await Promise.all(
      prevResult.map(async (item) => {
        const checkCurrentModule =
          await this.modules_of_deviceRepository.findOne({
            where: {
              apparatus_id: currentApparat.id,
              components_id: item.title.id,
            },
          });
        if (!checkCurrentModule) return item;
        if (checkCurrentModule.component_type_id) {
          const value = await this.language_module_type_listRepository.findOne({
            where: {
              language: lang,
              module_type_id: checkCurrentModule.component_type_id,
            },
          });

          return {
            id: checkCurrentModule.id,
            ...item,
            value: {
              id: checkCurrentModule.component_type_id,
              value: value.translation,
            },
          };
        } else {
          return item;
        }
      }),
    );

    // console.log(result);

    // const modulesDevice = await this.modules_of_deviceRepository.find({
    //   where: { apparatus_id: currentApparat.id },
    // });
    // const modulesDeviceTitles = await (async () => {
    //   const list = await Promise.all(
    //     modulesDevice.map(async (item) => {
    //       const title = await this.language_module_listRepository.findOne({
    //         where: { module_id: item.components_id, language: lang },
    //       });

    //       const value = await this.language_module_type_listRepository.findOne({
    //         where: { module_type_id: item.component_type_id, language: lang },
    //       });

    //       const variantLang = await (async () => {
    //         // const module_type_id_current =
    //         // await this.module_type_listRepository.findOne({
    //         //   where: {
    //         //     id: item.component_type_id,
    //         //   },
    //         // });
    //         // if (!module_type_id_current) return [];
    //         const variant = await this.module_type_listRepository.find({
    //           where: {
    //             components_id: item.components_id,
    //           },
    //         });
    //         // console.log(variant);

    //         if (!variant) return [];
    //         return await Promise.all(
    //           variant.map(async (item) => {
    //             const variantLangCurrent =
    //               await this.language_module_type_listRepository.findOne({
    //                 where: {
    //                   module_type_id: item.id,
    //                   language: lang,
    //                 },
    //               });

    //             return {
    //               id: item.id,
    //               // module_type_id: variantLangCurrent.id,

    //               component_type: variantLangCurrent.translation,
    //             };
    //           }),
    //         );
    //       })();

    //       return {
    //         variant: variantLang,
    //         id: item.id,
    //         apparatus_id: item.apparatus_id,
    //         title: {
    //           id: title.id,
    //           title: title.translation,
    //         },
    //         value: {
    //           id: value ? value.module_type_id : null,
    //           value: value ? value.translation : null,
    //         },
    //         lang: lang,
    //       };
    //     }),
    //   );

    //   const moduleListAll = await this.module_listRepository.find({
    //     where: {
    //       apparatus_type_id: 1,
    //     },
    //   });
    //   const result = await Promise.all(
    //     moduleListAll.map(async (item) => {
    //       const title = await this.language_module_listRepository.findOne({
    //         where: {
    //           module_id: item.id,
    //           language: lang,
    //         },
    //       });

    //       return {
    //         variant: [],
    //         id: item.id,
    //         apparatus_id: null,
    //         title: {
    //           id: title.id,
    //           title: title.translation,
    //         },
    //         value: {
    //           id: null,
    //           value: null,
    //         },
    //         lang: lang,
    //       };
    //     }),
    //   );

    //   if (list.length === 0) {
    //     const modulesDeviceCurrentFirst =
    //       await this.modules_of_deviceRepository.find({});
    //     const modulesDeviceNew = await this.modules_of_deviceRepository.find({
    //       where: { apparatus_id: modulesDeviceCurrentFirst[0].apparatus_id },
    //     });
    //     const newList = await Promise.all(
    //       modulesDeviceNew.map(async (newItem) => {
    //         const createModules = await this.modules_of_deviceRepository.save(
    //           this.modules_of_deviceRepository.create({
    //             apparatus_id: currentApparat.id,
    //             components_id: newItem.components_id,
    //             component_type_id: 0,
    //           }),
    //         );

    //         return createModules;
    //       }),
    //     );

    //     const list = await Promise.all(
    //       newList.map(async (item) => {
    //         const title = await this.language_module_listRepository.findOne({
    //           where: { module_id: item.components_id, language: lang },
    //         });

    //         const value =
    //           await this.language_module_type_listRepository.findOne({
    //             where: {
    //               module_type_id: item.component_type_id,
    //               language: lang,
    //             },
    //           });

    //         const variantLang = await (async () => {
    //           // const module_type_id_current =
    //           // await this.module_type_listRepository.findOne({
    //           //   where: {
    //           //     id: item.component_type_id,
    //           //   },
    //           // });
    //           // if (!module_type_id_current) return [];
    //           const variant = await this.module_type_listRepository.find({
    //             where: {
    //               components_id: item.components_id,
    //             },
    //           });
    //           // console.log(variant);

    //           if (!variant) return [];
    //           return await Promise.all(
    //             variant.map(async (item) => {
    //               const variantLangCurrent =
    //                 await this.language_module_type_listRepository.findOne({
    //                   where: {
    //                     module_type_id: item.id,
    //                     language: lang,
    //                   },
    //                 });

    //               return {
    //                 id: item.id,
    //                 // module_type_id: variantLangCurrent.id,

    //                 component_type: variantLangCurrent.translation,
    //               };
    //             }),
    //           );
    //         })();

    //         return {
    //           variant: variantLang,
    //           id: item.id,
    //           apparatus_id: item.apparatus_id,
    //           title: {
    //             id: title.id,
    //             title: title.translation,
    //           },
    //           value: {
    //             id: value ? value.module_type_id : null,
    //             value: value ? value.translation : null,
    //           },
    //           lang: lang,
    //         };
    //       }),
    //     );

    //     return list;
    //   } else {
    //     return result.map((item) => {
    //       const check = list.find(
    //         (checkItem) => checkItem.title.title === item.title.title,
    //       );

    //       if (!check) {
    //         return item;
    //       } else {
    //         return check;
    //       }
    //     });
    //   }
    // })();

    // SERVICE

    const serviceDeviceMaintenance =
      await this.service_maintenance_of_deviceRepository.find({
        where: { apparatus_id: currentApparat.id },
      });

    const serviceDeviceMaintenanceTitle = await (async () => {
      const list = await Promise.all(
        serviceDeviceMaintenance.map(async (item) => {
          const title =
            await this.language_service_maintenanceRepository.findOne({
              where: {
                maintenance_id: item.maintenance_id,
                language: lang,
              },
            });

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

      const serviceListAll = await this.service_maintenanceRepository.find({
        where: {
          apparatus_type_id: 1,
        },
      });
      const result = await Promise.all(
        serviceListAll.map(async (item) => {
          const title =
            await this.language_service_maintenanceRepository.findOne({
              where: {
                maintenance_id: item.id,
                language: lang,
              },
            });

          return {
            title: {
              id: title ? title.id : null,
              title: title ? title.translation : '',
            },
            value: {
              id: title ? title.maintenance_id : null,
              value: null,
            },
            lang: lang,
          };
        }),
      );

      const createNewService = async () => {
        const newService = await Promise.all(
          result.map(async (item) => {
            const total =
              await this.service_maintenance_of_deviceRepository.save(
                this.service_maintenance_of_deviceRepository.create({
                  apparatus_id: currentApparat.id,
                  maintenance_id: item.value.id,
                  value: 0,
                }),
              );

            return {
              title: {
                id: item.title ? item.title.id : null,
                title: item.title ? item.title.title : '',
              },
              value: {
                id: total ? total.id : null,
                value: 0,
              },
              lang: lang,
            };
          }),
        );
        return newService;
      };

      if (list.length === 0) {
        return await createNewService();
      } else {
        return result.map((item) => {
          const check = list
            .filter((item) => item !== null)
            .find((checkItem) => checkItem.title.title === item.title.title);

          if (!check) {
            return item;
          } else {
            return check;
          }
        });
      }
    })();
    return {
      code: 200,
      information: {
        name: nameApparat ? nameApparat.name : '',
        location: locationApparat ? locationApparat.translation : '',
        serial_number: currentApparat.serial_number,
        owner: ownerApparat ? ownerApparat.owner : '',
        user: userApparat ? userApparat.username : '',
        dealer: dealerApparat ? dealerApparat.username : '',
        operator: operatorApparat ? operatorApparat.username : '',
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
      complectation: result,
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
        type_id: 1,
      },
    });

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    let updateInfo = false;
    if (
      updateData.hasOwnProperty('name') &&
      Boolean(updateData.name) === true
    ) {
      const checkName = await this.device_customizationRepository.findOne({
        where: {
          apparatus_id: currentApparat.id,
          user_id: Number(user_id),
        },
      });
      if (checkName) {
        await this.device_customizationRepository.update(
          {
            apparatus_id: currentApparat.id,
            user_id: Number(user_id),
          },
          { name: updateData.name },
        );
      } else {
        await this.device_customizationRepository.save(
          this.device_customizationRepository.create({
            apparatus_id: currentApparat.id,
            user_id: Number(user_id),
            name: updateData.name,
          }),
        );
      }

      updateInfo = true;
    }

    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    if (
      [Role.CLIENT, Role.ADMIN, Role.MANAGER, Role.OPERATOR].includes(
        currentUser.role,
      )
    ) {
      return {
        code: 200,
        message: 'information update',
      };
    }

    if (
      updateData.hasOwnProperty('location') &&
      Boolean(updateData.location) === true
    ) {
      await this.language_locationRepository.update(
        {
          apparatus_id: currentApparat.id,
          language: updateData.lang,
        },
        { translation: updateData.location },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('owner') &&
      Boolean(updateData.owner) === true
    ) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { owners_id: updateData.owner },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('user') &&
      Boolean(updateData.user) === true
    ) {
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { user_id: updateData.user },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('dealer') &&
      Boolean(updateData.dealer) === true
    ) {
      if (typeof updateData.dealer !== 'string') {
        await this.apparatusRepository.update(
          {
            id: currentApparat.id,
          },
          { dealer_id: updateData.dealer },
        );
        updateInfo = true;
      }
    }

    if (
      updateData.hasOwnProperty('operator') &&
      Boolean(updateData.operator) === true
    ) {
      if (typeof updateData.operator !== 'string') {
        await this.apparatusRepository.update(
          {
            id: currentApparat.id,
          },
          { operator_id: updateData.operator },
        );
        updateInfo = true;
      }
    }

    if (
      updateData.hasOwnProperty('serial_number') &&
      Boolean(updateData.serial_number) === true
    ) {
      const checkSerialNumber = await this.apparatusRepository.findOne({
        where: {
          serial_number: updateData.serial_number,
          type_id: 1,
        },
      });
      if (checkSerialNumber) {
        return {
          code: 409,
          message: 'such a thing exists',
        };
      }
      await this.apparatusRepository.update(
        {
          id: currentApparat.id,
        },
        { serial_number: updateData.serial_number },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('number_score') &&
      Boolean(updateData.number_score) === true
    ) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { number_score: updateData.number_score },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('number_act') &&
      Boolean(updateData.number_act) === true
    ) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { number_act: updateData.number_act },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('shipment_date') &&
      Boolean(updateData.shipment_date) === true
    ) {
      await this.apparatusRepository.update(
        {
          serial_number: serial_number,
        },
        { shipment_date: updateData.shipment_date },
      );
      updateInfo = true;
    }

    if (
      updateData.hasOwnProperty('commissioning_date') &&
      Boolean(updateData.commissioning_date) === true
    ) {
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

    console.log(updateData);

    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    const currentApparat = await (async () => {
      if (currentUser.role === Role.SUPER_ADMIN) {
        return await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            type_id: 1,
          },
        });
      } else {
        const userApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            user_id: user_id,
            type_id: 1,
          },
        });
        if (userApparat) return userApparat;
        const dealerApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            dealer_id: user_id,
            type_id: 1,
          },
        });
        if (dealerApparat) return dealerApparat;

        const operatorApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            operator_id: user_id,
            type_id: 1,
          },
        });
        return operatorApparat;
      }
    })();

    if (!currentApparat) {
      return {
        code: 404,
        message: 'current aparat not found',
      };
    }

    try {
      await Promise.all(
        updateData.map(async (item) => {
          if (!item.id) {
            await this.modules_of_deviceRepository.save(
              this.modules_of_deviceRepository.create({
                apparatus_id: currentApparat.id,
                component_type_id: item.new_component_type_id,
                components_id: item.title,
              }),
            );
            return;
          }
          const checkModule = await this.modules_of_deviceRepository.findOne({
            where: {
              id: item.id,
            },
          });
          if (checkModule) {
            await this.modules_of_deviceRepository.update(
              {
                id: item.id,
                apparatus_id: item.apparatus_id,
              },
              {
                component_type_id: item.new_component_type_id,
              },
            );
          } else {
            await this.modules_of_deviceRepository.save(
              this.modules_of_deviceRepository.create({
                apparatus_id: currentApparat.id,
                component_type_id: item.new_component_type_id,
                components_id: item.title,
              }),
            );
          }
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

    const currentUser = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    const currentApparat = await (async () => {
      if (currentUser.role === Role.SUPER_ADMIN) {
        return await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            type_id: 1,
          },
        });
      } else {
        const userApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            user_id: user_id,
            type_id: 1,
          },
        });
        if (userApparat) return userApparat;
        const dealerApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            dealer_id: user_id,
            type_id: 1,
          },
        });
        if (dealerApparat) return dealerApparat;

        const operatorApparat = await this.apparatusRepository.findOne({
          where: {
            serial_number: serial_number,
            operator_id: user_id,
            type_id: 1,
          },
        });
        return operatorApparat;
      }
    })();

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
          if (!item.id) return;
          const checkMaintenance =
            await this.service_maintenance_of_deviceRepository.findOne({
              where: {
                id: item.id,
              },
            });
          if (checkMaintenance) {
            await this.service_maintenance_of_deviceRepository.update(
              {
                id: item.id,
              },
              { value: item.newValue },
            );
          } else {
            await this.service_maintenance_of_deviceRepository.save(
              this.service_maintenance_of_deviceRepository.create({
                maintenance_id: item.id,
                value: item.newValue,
                apparatus_id: currentApparat.id,
              }),
            );
          }
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
