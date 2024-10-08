import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reminder } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type DBMuliRequestOptions = {
  skip?: number;
  take?: number;
  cursor?: any;
  orderBy?: any;
  where?: any;
};

@Injectable()
export class ReminderService {
  constructor(private readonly PrismaService: PrismaService) {}

  async create(data: Reminder): Promise<Reminder> {
    try {
      return await this.PrismaService.reminder.create({ data });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async get(id: string): Promise<Reminder> {
    try {
      return await this.PrismaService.reminder.findUnique({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getAll(
    taskId: string,
    options: DBMuliRequestOptions,
  ): Promise<Reminder[]> {
    try {
      return await this.PrismaService.reminder.findMany({
        where: { taskId: taskId },
        ...options,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async update(id: string, data: Reminder): Promise<Reminder> {
    try {
      return await this.PrismaService.reminder.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async delete(id: string): Promise<Reminder> {
    try {
      return await this.PrismaService.reminder.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
