import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admininstration } from './entities/admininstration.entity';
import { users } from 'src/stat/entities/users.entity';
import { owners } from 'src/stat/entities/owner.entity';
import { users_connect } from 'src/stat/entities/users_connect';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

@Injectable()
export class AdmininstrationService {
  private readonly secretKey = '345gsd#fdfgsd';
  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    @InjectRepository(owners)
    private readonly ownersRepository: Repository<owners>,
    @InjectRepository(users_connect)
    private readonly usersConnectRepository: Repository<users_connect>,
  ) {}

  async adminQuick(user_id: number) {
    try {
      if (user_id === undefined) {
        return {
          code: 400,
          message: 'not such arguments',
        };
      }

      const allUsersConnect = await this.usersConnectRepository.find({
        where: {
          user_id: user_id,
        },
      });

      const allUsers = await Promise.all(
        allUsersConnect.map(async (item) => {
          return await this.usersRepository.findOne({
            where: {
              id: item.user_id_s,
            },
          });
        }),
      );

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

      const allOwners = await this.ownersRepository.find();

      return {
        code: 200,
        users: flattenedUserArray.map((item) => ({
          role: item.role,
          id: item.id,
          username: item.username,
          created_at: item.created_at,
        })),
        owners: allOwners,
      };
    } catch (err) {
      console.log(err);

      return {
        code: 500,
      };
    }
  }

  async adminUserFindOne(id: number) {
    if (id === undefined) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.usersRepository.findOne({
      where: { id: id },
    });

    if (!checkUser) {
      return {
        status: 404,
        message: 'not found user',
      };
    }

    return {
      code: 200,
      user: checkUser,
    };
  }

  async adminRegisterUser(login: string, password: string) {
    if (!login || !password) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.usersRepository.findOne({
      where: { username: login },
    });

    if (!checkUser) {
    } else {
      return {
        status: 409,
        message: 'This not user already exists',
      };
    }

    const newUser = this.usersRepository.create({
      username: login,
      password: bcrypt.hashSync(password),
    });

    return await this.usersRepository.save(newUser);
  }

  async adminUpdateUser(login: string, newPassword: string) {
    if (!login || !newPassword) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.usersRepository.findOne({
      where: { username: login },
    });

    if (!checkUser) {
      return {
        status: 409,
        message: 'This not user already exists',
      };
    }

    await this.usersRepository.update(
      { username: login },
      { password: bcrypt.hashSync(newPassword) },
    );
    return {
      code: 200,
      message: 'ok',
    };

    // if (bcrypt.compareSync(password, checkUser.password)) {
    //   await this.usersRepository.update(
    //     { username: login },
    //     { password: bcrypt.hashSync(newPassword) },
    //   );
    //   return {
    //     code: 200,
    //     message: 'ok',
    //   };
    // } else {
    //   return {
    //     code: 400,
    //     message: 'Password is not correct',
    //   };
    // }
  }

  async adminDeleteUser(login: string) {
    if (!login) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.usersRepository.findOne({
      where: { username: login },
    });

    if (!checkUser) {
      return {
        status: 409,
        message: 'This user already exists',
      };
    } else {
    }

    await this.usersRepository.delete({ username: login });

    return {
      code: 200,
      message: 'delete user',
    };
  }

  async adminRegisterOwner(owner: string) {
    if (!owner) {
      return {
        code: 400,
        message: 'Not enough arguments',
      };
    }

    const checkOwner = await this.ownersRepository.findOne({
      where: { owner: owner },
    });

    if (!checkOwner) {
    } else {
      return {
        code: 409,
        message: 'This owner already exists',
      };
    }

    const newOwner = await this.ownersRepository.save(
      this.ownersRepository.create({
        owner: owner,
      }),
    );

    return {
      code: 201,
      newOwner,
    };
  }

  async adminUpdateOwner(owner: string, newOwner: string) {
    if (!owner || !newOwner) {
      return {
        code: 400,
        message: 'Not enough arguments',
      };
    }

    const checkOwner = await this.ownersRepository.findOne({
      where: { owner: owner },
    });

    const checkNewOwner = await this.ownersRepository.findOne({
      where: { owner: newOwner },
    });

    if (checkNewOwner) {
      return {
        code: 409,
        message: 'This has already owner',
      };
    }

    if (!checkOwner) {
      return {
        code: 409,
        message: 'This not owner already exists',
      };
    } else {
    }
    await this.ownersRepository.update({ owner: owner }, { owner: newOwner });

    return {
      code: 200,
      message: 'ok',
    };
  }

  async adminDeleteOwner(owner: string) {
    if (!owner) {
      return {
        code: 400,
        message: 'Not enough arguments',
      };
    }

    const checkOwner = await this.ownersRepository.findOne({
      where: { owner: owner },
    });

    if (!checkOwner) {
      return {
        code: 409,
        message: 'This owner already exists',
      };
    }

    await this.ownersRepository.delete({ owner: owner });

    return {
      code: 200,
      message: 'delete owner',
    };
  }
}
