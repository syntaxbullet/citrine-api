import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from '../auth/discord.strategy';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secretOrPrivateKey: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, DiscordStrategy, JwtService],
})
export class AuthModule {}
