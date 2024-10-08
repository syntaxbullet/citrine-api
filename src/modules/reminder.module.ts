import { Module } from '@nestjs/common';
import { ReminderController } from '../controllers/reminder.controller';
import { ReminderService } from '../services/reminder.service';
import { TaskService } from '../services/task.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, TaskService, PrismaService],
})
export class ReminderModule {}
