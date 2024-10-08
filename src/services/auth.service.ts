import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
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
    const accessToken = this.JwtService.sign(
      {
        id: user.id,
        discord_id: user.discord_id,
        type: 'access',
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '1m', // 1 minute
      },
    );

    const refreshToken = this.JwtService.sign(
      {
        id: user.id,
        discord_id: user.discord_id,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', // 7 days
      },
    );

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
        where: { id: payload.id },
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new InternalServerErrorException('An unexpected error occurred');
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
      const isRewoked = await this.prismaService.refreshToken.findFirst({
        where: {
          token: token,
          deletedAt: {
            not: null,
          },
        },
      });
      if (isRewoked) {
        throw new UnauthorizedException('Token has been revoked');
      }
      // revoke the old token
      await this.prismaService.refreshToken.create({
        data: {
          token: token,
          userId: user.id,
          deletedAt: new Date(),
        },
      });
      return this.generateTokens(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
