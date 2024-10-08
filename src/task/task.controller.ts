import { Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { ReminderService } from '../reminder/reminder.service';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly ReminderService: ReminderService,
    private readonly TaskService: TaskService,
  ) {}
  @Get()
  async getAllTasks() {
    return 'Get all Tasks';
  }

  @Post()
  async createTask() {
    return 'Create Task';
  }

  @Put('/:taskId')
  async updateTask() {
    return 'Update Task';
  }

  @Delete('/:taskId')
  async deleteTask() {
    return 'Delete Task';
  }
}
