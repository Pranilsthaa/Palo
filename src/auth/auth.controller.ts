import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from 'src/common/decorators/user.decorator';
import type { AuthRequest } from 'src/types/authenticated-request.type';
import { AuthService } from './auth.service';
import { jwtRefreshAuthGuard } from './guards/refresh-auth.guard';

export class registerUser {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;

  @MinLength(10)
  @IsString()
  @IsNotEmpty()
  contact: string;
}

export class login {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: registerUser) {
    return this.authservice.registerUser(body);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: login) {
    return this.authservice.login(body);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(jwtRefreshAuthGuard)
  refresh(@User() user: AuthRequest['user']) {
    return this.authservice.getTokensAndSaveRefreshToken(
      user.userId,
      user.email,
    );
  }

  @Post('logout')
  @HttpCode(200)
  logout(@User() user: AuthRequest['user']) {
    return this.authservice.logout(user.userId);
  }
}
