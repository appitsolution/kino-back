import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admininstration } from './entities/admininstration.entity';
import { users } from 'src/stat/entities/users.entity';
import { owners } from 'src/stat/entities/owner.entity';
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
  ) {}

  async adminQuick() {
    const allUsers = await this.usersRepository.find();
    const allOwners = await this.ownersRepository.find();

    return {
      code: 200,
      users: allUsers.map((item) => ({
        role: item.role,
        id: item.id,
        username: item.username,
        created_at: item.created_at,
      })),
      owners: allOwners,
    };
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
