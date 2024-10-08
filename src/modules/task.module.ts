import { Module } from '@nestjs/common';
import { TaskController } from '../controllers/task.controller';
import { ReminderService } from '../services/reminder.service';
import { TaskService } from '../services/task.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [TaskController],
  providers: [ReminderService, TaskService, PrismaService],
})
export class TaskModule {}
