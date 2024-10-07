import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
// uses passport oauth2 discord strategy
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly JwtService: JwtService,
  ) {}

  async validateUser(profile: any) {
    try {
      let user = await this.prismaService.user.findUnique({
        where: {
          discord_id: profile.id,
        },
      });
      if (user) {
        return await this.prismaService.user.update({
          where: {
            discord_id: profile.id,
          },
          data: {
            name: profile.username,
            email: profile.email,
            avatar: profile.avatar,
          },
        });
      }
      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            discord_id: profile.id,
            name: profile.username,
            email: profile.email,
            avatar: profile.avatar,
          },
        });
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async generateTokens(user: any) {
    const authtokenpayload = {
      id: user.id,
      discord_id: user.discord_id,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60,
      type: 'access',
    };
    const refreshTokenPayload = {
      id: user.id,
      discord_id: user.discord_id,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      type: 'refresh',
    };
    const accessToken = this.JwtService.sign(authtokenpayload, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
    const refreshToken = this.JwtService.sign(refreshTokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async validateToken(token: string, type: string) {
    try {
      if (type === 'access') {
        return this.JwtService.verify(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
      }
      if (type === 'refresh') {
        return this.JwtService.verify(token, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.JwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.JwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') {
        throw new InternalServerErrorException('Invalid token');
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });
      if (!user) {
        throw new InternalServerErrorException('User not found');
      }
      return this.generateTokens(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
