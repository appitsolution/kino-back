import { Module } from '@nestjs/common';
import { AboutDevicesService } from './about-devices.service';
import { AboutDevicesController } from './about-devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutDevice } from './entities/about-device.entity';
import { errorDevices } from './entities/error.entity';
import { apparatusDevices } from './entities/apparatus.entity';
import { reservedPortionsDevices } from './entities/reserved_portions.entity';
import { group_listDevices } from './entities/group_list.entity';
import { language_location } from './entities/language_location.entity';
import { device_customization } from './entities/device_customization.etity';
import { apparatus } from 'src/stat/entities/apparatus.entity';
import { owners } from 'src/stat/entities/owner.entity';
import { users } from 'src/stat/entities/users.entity';
import { reservedPortions } from 'src/stat/entities/reserved_portions.entity';
import { modules_of_device } from 'src/stat/entities/modules_of_device.entity';
import { language_module_list } from 'src/stat/entities/language_module_list.entity';
import { language_module_type_list } from 'src/stat/entities/language_module_type_list.entity';
import { language_service_maintenance } from 'src/stat/entities/language_service_maintenance.entity';
import { service_maintenance_of_device } from 'src/stat/entities/service_maintenance_of_device.entity';
import { update_task } from 'src/stat/entities/update_task.entity';
import { module_type_list } from 'src/stat/entities/module_type_list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AboutDevice,
      errorDevices,
      apparatusDevices,
      reservedPortions,
      group_listDevices,
      language_location,
      device_customization,
      apparatus,
      owners,
      users,
      modules_of_device,
      language_module_list,
      language_module_type_list,
      language_service_maintenance,
      service_maintenance_of_device,
      update_task,
      module_type_list,
    ]),
  ],
  controllers: [AboutDevicesController],
  providers: [AboutDevicesService],
})
export class AboutDevicesModule {}
