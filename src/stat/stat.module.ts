import { Module } from '@nestjs/common';
import { StatService } from './stat.service';
import { StatController } from './stat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { reservedPortions } from './entities/reserved_portions.entity';
import { error } from './entities/error.entity';
import { group_list } from './entities/group_list.entity';
import { apparatus } from './entities/apparatus.entity';
import { users } from './entities/users.entity';
import { apparatuses_by_groups } from './entities/apparatuses_by_groups.entity';
import { device_customization } from 'src/about-devices/entities/device_customization.etity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      reservedPortions,
      error,
      group_list,
      apparatus,
      users,
      apparatuses_by_groups,
      device_customization,
    ]),
  ],
  controllers: [StatController],
  providers: [StatService],
})
export class StatModule {}
