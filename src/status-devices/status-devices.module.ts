import { Module } from '@nestjs/common';
import { StatusDevicesService } from './status-devices.service';
import { StatusDevicesController } from './status-devices.controller';
import { error } from 'src/stat/entities/error.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { reservedPortions } from 'src/stat/entities/reserved_portions.entity';
import { group_list } from 'src/stat/entities/group_list.entity';
import { language_location } from 'src/about-devices/entities/language_location.entity';
import { device_customization } from 'src/about-devices/entities/device_customization.etity';
import { owners } from 'src/stat/entities/owner.entity';
import { users } from 'src/stat/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cleaning } from 'src/stat/entities/cleaning.entity';
import { popcorn_level } from 'src/stat/entities/popcorn_level.entity';
import { actual_popcorn_lvl } from 'src/stat/entities/actual_popcorn_lvl.entity';
import { users_connect } from 'src/stat/entities/users_connect';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      error,
      apparatus,
      reservedPortions,
      group_list,
      language_location,
      device_customization,
      owners,
      users,
      cleaning,
      popcorn_level,
      actual_popcorn_lvl,
      users_connect,
    ]),
  ],
  controllers: [StatusDevicesController],
  providers: [StatusDevicesService],
})
export class StatusDevicesModule {}
