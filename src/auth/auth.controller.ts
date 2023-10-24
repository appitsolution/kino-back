import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { VerifyAuthDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @ApiBody({ type: VerifyAuthDto })
  @Post('me')
  verify(@Body() args: { token: string }) {
    return this.authService.verify(args.token);
  }

  // @Get('all')
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @ApiQuery({ name: 'id' })
  // @Get('one/:id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  @ApiQuery({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
