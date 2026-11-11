import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    if (
      typeof body !== 'object' ||
      body === null ||
      Array.isArray(body) ||
      !('username' in body) ||
      !('password' in body) ||
      typeof body.username !== 'string' ||
      body.username.trim().length === 0 ||
      typeof body.password !== 'string' ||
      body.password.length === 0
    ) {
      throw new BadRequestException('username and password are required');
    }

    const username = body.username.trim();
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    return this.usersService.createUser(username, body.password);
  }

  @Post('login')
  async login(@Body() body: unknown) {
    if (
      typeof body !== 'object' ||
      body === null ||
      !('username' in body) ||
      !('password' in body) ||
      typeof body.username !== 'string' ||
      body.username.trim().length === 0 ||
      typeof body.password !== 'string' ||
      body.password.length === 0
    ) {
      throw new BadRequestException('username and password are required');
    }

    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('logout')
  async logout(@Body() body: { userId: number }) {
    return this.authService.logout(body.userId);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshTokens(body.refreshToken);
  }
}