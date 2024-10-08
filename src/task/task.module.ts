import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { ReminderService } from '../reminder/reminder.service';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TaskController],
  providers: [ReminderService, TaskService, PrismaService],
})
export class TaskModule {}
