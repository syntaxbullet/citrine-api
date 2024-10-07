import { Module } from '@nestjs/common';
import { ReminderModule } from './reminder.module';
import { TaskModule } from './task.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [ReminderModule, TaskModule, AuthModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
