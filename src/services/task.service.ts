import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from './prisma.service';

type DBMuliRequestOptions = {
  skip?: number;
  take?: number;
  cursor?: any;
  orderBy?: any;
  where?: any;
};

@Injectable()
export class TaskService {
  constructor(private readonly PrismaService: PrismaService) {}

  async create(data: Task): Promise<Task> {
    try {
      return await this.PrismaService.task.create({ data });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async get(id: string): Promise<Task> {
    try {
      return await this.PrismaService.task.findUnique({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getAll(userId: string, options: DBMuliRequestOptions): Promise<Task[]> {
    try {
      return await this.PrismaService.task.findMany({
        where: { userId: userId },
        ...options,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async belongsToUser(userId: string, taskId: string): Promise<boolean> {
    try {
      const task = await this.PrismaService.task.findFirst({
        where: { id: taskId, userId: userId },
      });
      return !!task;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async update(id: string, data: Task): Promise<Task> {
    try {
      return await this.PrismaService.task.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async delete(id: string): Promise<Task> {
    try {
      return await this.PrismaService.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
