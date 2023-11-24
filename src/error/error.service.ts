import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { error } from 'src/stat/entities/error.entity';
import { users } from 'src/stat/entities/users.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { sendNotification } from 'src/utils/send-notification';
import { notification } from 'src/stat/entities/notification.entity';
import { error_processed } from 'src/stat/entities/error_processed.entity';
import { cleaning } from 'src/stat/entities/cleaning.entity';
import { actual_popcorn_lvl } from 'src/stat/entities/actual_popcorn_lvl.entity';
import { users_connect } from 'src/stat/entities/users_connect';

@Injectable()
export class ErrorService {
  private firstStartError = false;
  private firstStartClear = false;
  private firstStartPopcorn = false;

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
  @InjectRepository(cleaning)
  private readonly cleaningRepository: Repository<cleaning>;
  @InjectRepository(actual_popcorn_lvl)
  private readonly actualPopcornRepository: Repository<actual_popcorn_lvl>;
  @InjectRepository(users_connect)
  private readonly usersConnectRepository: Repository<users_connect>;

  getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return { date: formattedDate, time: formattedTime };
  };

  parseDateToCustomFormatPlus = (inputDate) => {
    const date = new Date(inputDate);

    date.setDate(date.getDate() + 7);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${year}-${month}-${day}`;
  };

  daysUntil = (targetDate: Date) => {
    const currentDate = new Date();
    const targetDateTime = new Date(targetDate);

    if (targetDateTime <= currentDate) {
      return 0;
    }

    const timeDifference = targetDateTime.getTime() - currentDate.getTime();

    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysRemaining;
  };

  async getAllUserTree(user_id: number) {
    const getUserTree = async (userId) => {
      const userConnects = await this.usersConnectRepository.find({
        where: {
          user_id: userId,
        },
      });

      const userTree = [];

      await Promise.all(
        userConnects.map(async (userConnect) => {
          const user = await this.usersRepository.findOne({
            where: {
              id: userConnect.user_id_s,
            },
          });

          if (user) {
            userTree.push({
              user,
              subTree: await getUserTree(user.id),
            });
          }
        }),
      );

      return userTree;
    };

    const flattenUserTree = (userTree) => {
      const flatArray = [];

      userTree.forEach((node) => {
        flatArray.push(node.user);
        flatArray.push(...flattenUserTree(node.subTree));
      });

      return flatArray;
    };

    const userTree = await getUserTree(user_id);
    const flattenedUserArray = flattenUserTree(userTree);

    return flattenedUserArray;
  }

  async startError() {
    const lastProcessedId = await this.error_processedRepository.findOne({
      where: {
        id: 1,
      },
    });
    return lastProcessedId.last_processed_id;
  }

  async createError(serial_number: string, text_error: string) {
    if (!serial_number || !text_error) {
      return {
        code: 400,
        message: 'not such arguments',
      };
    }

    const usersAparatus = await this.apparatusRepository.find({
      where: {
        serial_number: serial_number,
      },
    });

    const users = usersAparatus.map((item) => {
      return { user_id: item.user_id, read: false };
    });

    const dealers = usersAparatus.map((item) => {
      return { user_id: item.dealer_id, read: false };
    });

    const operators = usersAparatus.map((item) => {
      return { user_id: item.operator_id, read: false };
    });

    const listSuperAdmin = (await this.allSuperAdmin()).map((item) => {
      return { user_id: item.id, read: false };
    });

    const listUsers = await Promise.all(
      usersAparatus.map(async (item) => {
        const list = await this.getAllUserTree(item.user_id);
        const newList = list.map((user) => {
          return { user_id: user.user_id, read: false };
        });

        return newList;
      }),
    );

    const allUsers = [
      ...users,
      ...dealers,
      ...operators,
      ...listSuperAdmin,
      ...listUsers.flat(),
    ];

    const filterUsers = [];
    allUsers.forEach((item) => {
      if (!filterUsers.find((obj) => obj.user_id === item.user_id)) {
        filterUsers.push(item);
      }
    });

    const dateAndTime = this.getFormattedDateTime();

    const result = await this.errorRepository.save(
      this.errorRepository.create({
        serial_number: serial_number,
        date: dateAndTime.date,
        time: dateAndTime.time,
        text_error: text_error,
        read: JSON.stringify({ users: filterUsers }),
      }),
    );

    return result;
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

  async allSuperAdmin() {
    const allSuperAdmin = await this.usersRepository.find({
      where: { role: 'SUPER_ADMIN' },
    });

    return allSuperAdmin;
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

      await Promise.all(
        newErrors.map(async (error) => {
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

              const dealerToken = await (async () => {
                const checkToken = await this.notificationRepository.findOne({
                  where: {
                    user_id: item.dealer_id,
                  },
                });
                if (checkToken) {
                  return checkToken.token;
                } else {
                  return '';
                }
              })();

              const operatorToken = await (async () => {
                const checkToken = await this.notificationRepository.findOne({
                  where: {
                    user_id: item.operator_id,
                  },
                });
                if (checkToken) {
                  return checkToken.token;
                } else {
                  return '';
                }
              })();

              const checkDuplicat = [
                token ? token.token : '',
                dealerToken,
                operatorToken,
              ];

              if (token) {
                await sendNotification(
                  token.token,
                  'KINOPROKAT VENDING',
                  `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
                );
              }

              if (dealerToken) {
                await sendNotification(
                  dealerToken,
                  'KINOPROKAT VENDING',
                  `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
                );
              }

              if (operatorToken) {
                await sendNotification(
                  operatorToken,
                  'KINOPROKAT VENDING',
                  `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
                );
              }

              const listSuperAdmin = await this.allSuperAdmin();

              await Promise.all(
                listSuperAdmin.map(async (item) => {
                  const tokenSuper = await this.notificationRepository.findOne({
                    where: {
                      user_id: item.id,
                    },
                  });
                  if (!tokenSuper) return;

                  if (
                    tokenSuper.token &&
                    !checkDuplicat.includes(tokenSuper.token)
                  ) {
                    await sendNotification(
                      tokenSuper.token,
                      'KINOPROKAT VENDING',
                      `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
                    );
                  }
                }),
              );

              const listUsers = await this.getAllUserTree(item.user_id);
              const filterListUsers = [];
              listUsers.forEach((filterItem) => {
                const checkFilterUser = filterListUsers.find(
                  (findItem) => findItem.id === filterItem.id,
                );
                const checkFilterAdmins = listSuperAdmin.find(
                  (findItem) => findItem.id === filterItem.id,
                );
                if (checkFilterUser || checkFilterAdmins) {
                  return;
                } else {
                  return filterListUsers.push(filterItem);
                }
              });

              await Promise.all(
                filterListUsers.map(async (user) => {
                  if (user.user_id === undefined) return;
                  const currentToken =
                    await this.notificationRepository.findOne({
                      where: {
                        user_id: user.user_id,
                      },
                    });
                  if (!checkDuplicat.includes(currentToken.token)) {
                    if (user.user_id === item.user_id) return;
                    await sendNotification(
                      currentToken.token,
                      'KINOPROKAT VENDING',
                      `Важливо! Апарат: ${error.serial_number}\n${error.text_error}`,
                    );
                  }
                  return;
                }),
              );
            }),
          );
        }),
      );

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

  async checkLvlPopcorn() {
    const allApparatus = await this.apparatusRepository.find();

    allApparatus.forEach(async (item) => {
      const actualPopcorn = await this.actualPopcornRepository.findOne({
        where: {
          serial_number: item.serial_number,
        },
      });

      if (!actualPopcorn) {
        const token = await this.notificationRepository.findOne({
          where: {
            user_id: item.user_id,
          },
        });

        const dealerToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.dealer_id,
          },
        });

        const operatorToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.operator_id,
          },
        });

        if (token) {
          await sendNotification(
            token.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        if (dealerToken) {
          await sendNotification(
            dealerToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        if (operatorToken) {
          await sendNotification(
            operatorToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        const listSuperAdmin = await this.allSuperAdmin();

        await Promise.all(
          listSuperAdmin.map(async (superAdmin) => {
            const tokenSuper = await this.notificationRepository.findOne({
              where: {
                user_id: superAdmin.id,
              },
            });

            if (tokenSuper) {
              await sendNotification(
                tokenSuper.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
              );
            }
          }),
        );

        const listUsers = await this.getAllUserTree(item.user_id);
        await Promise.all(
          listUsers.map(async (user) => {
            const token = await this.notificationRepository.findOne({
              where: {
                user_id: user.user_id,
              },
            });
            if (token) {
              if (user.user_id === item.user_id) return;
              await sendNotification(
                token.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
              );
            }

            return;
          }),
        );

        return;
      }

      if (actualPopcorn.actual_lvl < 15) {
        const token = await this.notificationRepository.findOne({
          where: {
            user_id: item.user_id,
          },
        });

        const dealerToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.dealer_id,
          },
        });

        const operatorToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.operator_id,
          },
        });

        if (token) {
          await sendNotification(
            token.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        if (dealerToken) {
          await sendNotification(
            dealerToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        if (operatorToken) {
          await sendNotification(
            operatorToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
          );
        }

        const listSuperAdmin = await this.allSuperAdmin();

        await Promise.all(
          listSuperAdmin.map(async (superAdmin) => {
            const tokenSuper = await this.notificationRepository.findOne({
              where: {
                user_id: superAdmin.id,
              },
            });

            if (tokenSuper) {
              await sendNotification(
                tokenSuper.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
              );
            }
          }),
        );

        const listUsers = await this.getAllUserTree(item.user_id);
        await Promise.all(
          listUsers.map(async (user) => {
            const token = await this.notificationRepository.findOne({
              where: {
                user_id: user.user_id,
              },
            });
            if (token) {
              if (user.user_id === item.user_id) return;
              await sendNotification(
                token.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} \nРівень попкорну критичний`,
              );
            }

            return;
          }),
        );
      }
    });
  }

  async checkClear() {
    const allApparatus = await this.apparatusRepository.find();

    allApparatus.forEach(async (item) => {
      const lastClear = await this.cleaningRepository.query(
        'SELECT * FROM cleaning WHERE serial_number = ? ORDER BY id DESC LIMIT 5;',
        [item.serial_number],
      );

      if (lastClear.length === 0) {
        const token = await this.notificationRepository.findOne({
          where: {
            user_id: item.user_id,
          },
        });

        const dealerToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.dealer_id,
          },
        });

        const operatorToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.operator_id,
          },
        });

        if (token) {
          await sendNotification(
            token.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        if (dealerToken) {
          await sendNotification(
            dealerToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        if (operatorToken) {
          await sendNotification(
            operatorToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        const listSuperAdmin = await this.allSuperAdmin();

        await Promise.all(
          listSuperAdmin.map(async (superAdmin) => {
            const tokenSuper = await this.notificationRepository.findOne({
              where: {
                user_id: superAdmin.id,
              },
            });

            if (tokenSuper) {
              await sendNotification(
                tokenSuper.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
              );
            }
          }),
        );

        const listUsers = await this.getAllUserTree(item.user_id);
        await Promise.all(
          listUsers.map(async (user) => {
            const token = await this.notificationRepository.findOne({
              where: {
                user_id: user.user_id,
              },
            });
            if (token) {
              if (user.user_id === item.user_id) return;
              await sendNotification(
                token.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
              );
            }

            return;
          }),
        );

        return;
      }

      const dateLastClear =
        Number(
          this.daysUntil(
            new Date(this.parseDateToCustomFormatPlus(lastClear[0].date)),
          ),
        ) / 7;

      if (!dateLastClear) {
        const token = await this.notificationRepository.findOne({
          where: {
            user_id: item.user_id,
          },
        });

        const dealerToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.dealer_id,
          },
        });

        const operatorToken = await this.notificationRepository.findOne({
          where: {
            user_id: item.operator_id,
          },
        });

        if (token) {
          await sendNotification(
            token.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        if (dealerToken) {
          await sendNotification(
            dealerToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        if (operatorToken) {
          await sendNotification(
            operatorToken.token,
            'KINOPROKAT VENDING',
            `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
          );
        }

        const listSuperAdmin = await this.allSuperAdmin();

        await Promise.all(
          listSuperAdmin.map(async (superAdmin) => {
            const tokenSuper = await this.notificationRepository.findOne({
              where: {
                user_id: superAdmin.id,
              },
            });

            if (tokenSuper) {
              await sendNotification(
                tokenSuper.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
              );
            }
          }),
        );

        const listUsers = await this.getAllUserTree(item.user_id);
        await Promise.all(
          listUsers.map(async (user) => {
            const token = await this.notificationRepository.findOne({
              where: {
                user_id: user.user_id,
              },
            });
            if (token) {
              if (user.user_id === item.user_id) return;
              await sendNotification(
                token.token,
                'KINOPROKAT VENDING',
                `Важливо! Апарат: ${item.serial_number} потрібно очистити`,
              );
            }

            return;
          }),
        );
      }
    });
  }

  startPolling() {
    const pollingInterval = 1200;

    if (!this.firstStartError) {
      this.firstStartError = true;
    } else {
      this.pollForNewErrors();
    }

    setInterval(() => {
      if (!this.firstStartError) {
        this.firstStartError = true;
      } else {
        this.pollForNewErrors();
      }
    }, pollingInterval);
  }

  startClear() {
    const pollingInterval = 1000 * 60 * 60 * 24;

    if (!this.firstStartClear) {
      this.firstStartClear = true;
    } else {
      this.checkClear();
    }

    setInterval(() => {
      if (!this.firstStartClear) {
        this.firstStartClear = true;
      } else {
        this.checkClear();
      }
    }, pollingInterval);
  }

  startActualLvlPopcorn() {
    const pollingInterval = 1000 * 60 * 60 * 4;

    if (!this.firstStartPopcorn) {
      this.firstStartPopcorn = true;
    } else {
      this.checkLvlPopcorn();
    }

    setInterval(() => {
      if (!this.firstStartPopcorn) {
        this.firstStartPopcorn = true;
      } else {
        this.checkLvlPopcorn();
      }
    }, pollingInterval);
  }
}
