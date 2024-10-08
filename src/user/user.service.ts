import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly PrismaService: PrismaService) {}

  async create(data: User): Promise<User> {
    try {
      return await this.PrismaService.user.create({ data });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async get(id: string): Promise<User> {
    try {
      return await this.PrismaService.user.findUnique({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async update(id: string, data: User): Promise<User> {
    try {
      return await this.PrismaService.user.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async delete(id: string): Promise<User> {
    try {
      return await this.PrismaService.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
