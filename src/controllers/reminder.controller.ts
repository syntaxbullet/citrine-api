import { Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { ReminderService } from '../services/reminder.service';
import { TaskService } from '../services/task.service';

@Controller('reminders')
export class ReminderController {
  constructor(
    private readonly ReminderService: ReminderService,
    private readonly TaskService: TaskService,
  ) {}
  @Get('/:taskId')
  async getAllReminders() {
    return 'Get all reminders';
  }

  @Post('/:taskId')
  async createReminder() {
    return 'Create reminder';
  }

  @Put('/:taskId/:reminderId')
  async updateReminder() {
    return 'Update reminder';
  }

  @Delete('/:taskId/:reminderId')
  async deleteReminder() {
    return 'Delete reminder';
  }
}
