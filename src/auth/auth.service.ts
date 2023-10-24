import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { LoginAuthDto } from './dto/login-auth.dto';
import { users } from 'src/stat/entities/users.entity';
import { Role } from 'src/constants/roles';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
4;

@Injectable()
export class AuthService {
  private readonly secretKey = '345gsd#fdfgsd';
  constructor(
    @InjectRepository(users) private repositoryusers: Repository<users>,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    if (
      !createAuthDto.login ||
      !createAuthDto.role ||
      !createAuthDto.password
    ) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.repositoryusers.findOne({
      where: { username: createAuthDto.login },
    });

    if (!checkUser) {
    } else {
      return {
        code: 409,
        message: 'This user already exists',
      };
    }

    let checkRole = false;
    for (let role in Role) {
      if (createAuthDto.role === role) {
        checkRole = true;
      }
    }

    if (!checkRole) {
      return {
        code: 404,
        message: 'not found role',
      };
    }

    const newUser = await this.repositoryusers.save(
      this.repositoryusers.create({
        role: createAuthDto.role,
        username: createAuthDto.login,
        password: bcrypt.hashSync(createAuthDto.password),
      }),
    );

    return {
      code: 201,
      newUser,
    };
  }

  async login(loginAuthDto: LoginAuthDto) {
    if (!loginAuthDto.login || !loginAuthDto.password) {
      return {
        code: 400,
        message: 'Not enough arguments',
      };
    }

    const checkUser = await this.repositoryusers.findOne({
      where: { username: loginAuthDto.login },
    });

    console.log(checkUser);

    if (!checkUser) {
      return {
        code: 404,
        message: 'Not Found',
      };
    }

    if (bcrypt.compareSync(loginAuthDto.password, checkUser.password)) {
      return {
        code: 200,
        token: jwt.sign(
          { username: loginAuthDto.login, role: checkUser.role },
          this.secretKey,
        ),
      };
    } else {
      return {
        code: 400,
        message: 'Password is not correct',
      };
    }
  }

  async verify(token: string) {
    if (!token) {
      return {
        code: 400,
        message: 'Not enough arguments',
      };
    }

    const login = jwt.verify(token, this.secretKey);
    const user = await this.repositoryusers.findOne({
      where: { username: login.username },
    });
    if (!user) {
      return {
        code: 404,
        message: 'Not Found',
      };
    }
    return { code: 200, user };
  }

  async findAll() {
    return await this.repositoryusers.find();
  }

  async findOne(id: number) {
    if (id === undefined || id === null) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }
    const user = await this.repositoryusers.findOne({ where: { id } });

    if (!user) {
      return {
        status: 404,
        message: 'Not Found',
      };
    }

    return user;
  }

  async remove(id: number) {
    if (id === undefined || id === null) {
      return {
        status: 400,
        message: 'Not enough arguments',
      };
    }
    const user = await this.repositoryusers.findOne({ where: { id } });

    if (!user) {
      return {
        status: 404,
        message: 'Not Found',
      };
    }

    await this.repositoryusers.delete({ id });

    return {
      status: 200,
      message: 'ok',
    };
  }
}
