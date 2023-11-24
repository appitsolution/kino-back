import { Module } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ErrorController } from './error.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { error } from 'src/stat/entities/error.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { users } from 'src/stat/entities/users.entity';
import { notification } from 'src/stat/entities/notification.entity';
import { error_processed } from 'src/stat/entities/error_processed.entity';
import { apparatusDevices } from 'src/about-devices/entities/apparatus.entity';
import { cleaning } from 'src/stat/entities/cleaning.entity';
import { actual_popcorn_lvl } from 'src/stat/entities/actual_popcorn_lvl.entity';
import { users_connect } from 'src/stat/entities/users_connect';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      error,
      apparatus,
      users,
      notification,
      error_processed,
      apparatusDevices,
      cleaning,
      actual_popcorn_lvl,
      users_connect,
    ]),
  ],
  controllers: [ErrorController],
  providers: [ErrorService],
})
export class ErrorModule {
  constructor(private readonly errorService: ErrorService) {
    this.errorService.startPolling();
    this.errorService.startClear();
    this.errorService.startActualLvlPopcorn();
  }
}
