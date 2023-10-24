import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { group_list } from 'src/stat/entities/group_list.entity';
import { apparatuses_by_groups } from 'src/stat/entities/apparatuses_by_groups.entity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { users } from 'src/stat/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      group_list,
      apparatuses_by_groups,
      apparatus,
      users,
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
