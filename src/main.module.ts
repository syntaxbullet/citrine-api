import { Module } from '@nestjs/common';
import { ReminderModule } from './reminder/reminder.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ReminderModule, TaskModule, AuthModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
