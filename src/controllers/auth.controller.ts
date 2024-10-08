import { DiscordGuard } from '../auth/discord.guard';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthService } from '../services/auth.service';
import { Controller, Get, UseGuards, Req, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Get('discord')
  @UseGuards(DiscordGuard)
  async discordLogin() {
    return 'Discord Login';
  }

  @Get('callback')
  @UseGuards(DiscordGuard)
  async discordLoginCallback(@Req() req) {
    return await this.AuthService.generateTokens(req.user);
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  async me(@Req() req) {
    return await this.AuthService.getUserFromToken(
      req.headers.authorization.split(' ')[1],
    );
  }
  @Post('refresh')
  async refresh(@Req() req) {
    if (!req.body.refreshToken) {
      throw new Error('No refresh token provided');
    }
    return await this.AuthService.refreshToken(req.body.refreshToken);
  }
}
