import { Test, TestingModule } from '@nestjs/testing';
import { StatusDevicesController } from './status-devices.controller';
import { StatusDevicesService } from './status-devices.service';

describe('StatusDevicesController', () => {
  let controller: StatusDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusDevicesController],
      providers: [StatusDevicesService],
    }).compile();

    controller = module.get<StatusDevicesController>(StatusDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
