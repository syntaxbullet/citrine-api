import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { TaskService } from '../task/task.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, TaskService, PrismaService],
})
export class ReminderModule {}
