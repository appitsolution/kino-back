import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StatModule } from './stat/stat.module';
import { AboutDevicesModule } from './about-devices/about-devices.module';
import { AdmininstrationModule } from './admininstration/admininstration.module';
import { GroupModule } from './group/group.module';
import { Auth } from './auth/entities/auth.entity';
import { AboutDevice } from './about-devices/entities/about-device.entity';
import { Admininstration } from './admininstration/entities/admininstration.entity';
import { Group } from './group/entities/group.entity';
import { reservedPortions } from './stat/entities/reserved_portions.entity';
import { error } from './stat/entities/error.entity';
import { group_list } from './stat/entities/group_list.entity';
import { apparatus } from './stat/entities/apparatus.entity';
import { StatService } from './stat/stat.service';
import { reservedPortionsDevices } from './about-devices/entities/reserved_portions.entity';
import { errorDevices } from './about-devices/entities/error.entity';
import { group_listDevices } from './about-devices/entities/group_list.entity';
import { apparatusDevices } from './about-devices/entities/apparatus.entity';
import { device_customization } from './about-devices/entities/device_customization.etity';
import { language_location } from './about-devices/entities/language_location.entity';
import { owners } from './stat/entities/owner.entity';
import { users } from './stat/entities/users.entity';
import { StatusDevicesModule } from './status-devices/status-devices.module';
import { apparatuses_by_groups } from './stat/entities/apparatuses_by_groups.entity';
import { modules_of_device } from './stat/entities/modules_of_device.entity';
import { language_module_list } from './stat/entities/language_module_list.entity';
import { language_module_type_list } from './stat/entities/language_module_type_list.entity';
import { service_maintenance_of_device } from './stat/entities/service_maintenance_of_device.entity';
import { language_service_maintenance } from './stat/entities/language_service_maintenance.entity';
import { update_task } from './stat/entities/update_task.entity';
import { cleaning } from './stat/entities/cleaning.entity';
import { popcorn_level } from './stat/entities/popcorn_level.entity';
import { GuardModule } from './guard/guard.module';
import { actual_popcorn_lvl } from './stat/entities/actual_popcorn_lvl.entity';
import { module_type_list } from './stat/entities/module_type_list.entity';
import { NotificationModule } from './notification/notification.module';
import { notification } from './stat/entities/notification.entity';
import { ErrorModule } from './error/error.module';
import { error_processed } from './stat/entities/error_processed.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'api',
      entities: [
        Auth,
        AboutDevice,
        Admininstration,
        Group,
        reservedPortions,
        error,
        group_list,
        apparatus,
        reservedPortionsDevices,
        errorDevices,
        group_listDevices,
        apparatusDevices,
        device_customization,
        language_location,
        owners,
        users,
        apparatuses_by_groups,
        modules_of_device,
        module_type_list,
        language_module_list,
        language_module_type_list,
        language_service_maintenance,
        service_maintenance_of_device,
        update_task,
        cleaning,
        popcorn_level,
        actual_popcorn_lvl,
        notification,
        error_processed,
      ],
      synchronize: false,
    }),

    AuthModule,
    StatModule,
    AboutDevicesModule,
    AdmininstrationModule,
    GroupModule,
    StatusDevicesModule,
    GuardModule,
    NotificationModule,
    ErrorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
