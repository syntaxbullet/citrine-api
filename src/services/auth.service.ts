import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import {
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Selects the appropriate JWT secret based on token type
  private getJwtSecret(type: string): string {
    return type === 'access'
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;
  }

  // Handles common JWT token errors and throws appropriate exceptions
  private handleTokenError(error: any): never {
    if (error.name === 'TokenExpiredError') {
      this.logger.warn('Token has expired');
      throw new UnauthorizedException('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      this.logger.warn('Invalid token');
      throw new UnauthorizedException('Invalid token');
    }
    this.logger.error('Failed to validate token', error.stack);
    throw new InternalServerErrorException('Failed to validate token.');
  }

  /**
   * Validates the user by Discord profile.
   * Updates existing user or creates a new one if not found.
   * @param profile - Discord profile information
   * @returns The validated or newly created user
   */
  async validateUser(profile: any): Promise<User> {
    try {
      let user = await this.prismaService.user.findUnique({
        where: {
          discord_id: profile.id,
        },
      });
      if (user) {
        // Update user details if the user already exists
        this.logger.log(`Updating user details`);
        user = await this.prismaService.user.update({
          where: {
            discord_id: profile.id,
          },
          data: {
            name: profile.username,
            email: profile.email,
            avatar: profile.avatar,
          },
        });
      } else {
        // Create a new user if not found
        this.logger.log(`Creating new user`);
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
      this.logger.error('Failed to validate or create user', error.stack);
      throw new InternalServerErrorException(
        'Failed to validate or create user.',
      );
    }
  }

  /**
   * Generates access and refresh tokens for the user.
   * @param user - The user for whom tokens are being generated
   * @returns An object containing access and refresh tokens
   */
  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      this.logger.log(`Generating tokens for user`);
      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          discord_id: user.discord_id,
          type: 'access',
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '30m', // 30 minutes
        },
      );

      const refreshToken = this.jwtService.sign(
        {
          id: user.id,
          discord_id: user.discord_id,
          type: 'refresh',
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d', // 7 days
          jwtid: Math.random().toString(36).substr(2, 10), // Add a unique identifier for each token
        },
      );
      // Invalidate previous refresh tokens for the user
      this.logger.log(`Invalidating previous refresh tokens for user`);
      await this.prismaService.$transaction([
        this.prismaService.refreshToken.updateMany({
          where: {
            userId: user.id,
            isRevoked: false,
          },
          data: {
            isRevoked: true,
          },
        }),
        this.prismaService.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            isRevoked: false,
          },
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Failed to generate tokens', error.stack);
      throw new InternalServerErrorException('Failed to generate tokens.');
    }
  }

  /**
   * Validates a given JWT token based on its type (access or refresh).
   * @param token - The JWT token to be validated
   * @param type - The type of token ('access' or 'refresh')
   * @returns The decoded token payload if valid
   */
  async validateToken(token: string, type: string): Promise<any> {
    try {
      this.logger.log(`Validating token`);
      const secret = this.getJwtSecret(type);
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      this.handleTokenError(error);
    }
  }

  /**
   * Retrieves a user based on the provided access token.
   * @param token - The access token
   * @returns The user associated with the token
   */
  async getUserFromToken(token: string): Promise<User> {
    try {
      this.logger.log('Getting user from token');
      const payload = await this.validateToken(token, 'access');

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        this.logger.warn(`User not found`);
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.handleTokenError(error);
    }
  }

  /**
   * Refreshes the access and refresh tokens using a valid refresh token.
   * Revokes the old refresh token and generates new tokens.
   * @param token - The refresh token
   * @returns An object containing new access and refresh tokens
   */
  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      this.logger.log('Refreshing tokens using refresh token');
      const payload = await this.validateToken(token, 'refresh');

      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
      });
      if (!user) {
        this.logger.warn(`User not found with ID: ${payload.id}`);
        throw new NotFoundException('User not found');
      }
      const isRevoked = await this.prismaService.refreshToken.findFirst({
        where: {
          token: token,
          isRevoked: true,
        },
      });
      if (isRevoked) {
        this.logger.warn('Token has been revoked');
        throw new UnauthorizedException('Token has been revoked');
      }
      // revoke the old token and generate a new one
      this.logger.log(`Revoking old refresh token for user`);
      await this.prismaService.$transaction([
        this.prismaService.refreshToken.updateMany({
          where: {
            userId: user.id,
            isRevoked: false,
          },
          data: {
            isRevoked: true,
          },
        }),
        // create a new entry for the passed token marking it as revoked
        this.prismaService.refreshToken.create({
          data: {
            token: token,
            userId: user.id,
            isRevoked: true,
          },
        }),
      ]);
      // generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      this.handleTokenError(error);
    }
  }
}
