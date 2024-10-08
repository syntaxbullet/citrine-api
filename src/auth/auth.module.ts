import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, DiscordStrategy, JwtService],
})
export class AuthModule {}
