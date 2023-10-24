import { Module } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ErrorController } from './error.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { error } from 'src/stat/entities/error.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { users } from 'src/stat/entities/users.entity';
import { notification } from 'src/stat/entities/notification.entity';
import { error_processed } from 'src/stat/entities/error_processed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      error,
      apparatus,
      users,
      notification,
      error_processed,
    ]),
  ],
  controllers: [ErrorController],
  providers: [ErrorService],
})
export class ErrorModule {
  constructor(private readonly errorService: ErrorService) {
    this.errorService.startPolling();
  }
}
