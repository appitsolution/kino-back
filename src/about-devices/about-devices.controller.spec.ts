import { Test, TestingModule } from '@nestjs/testing';
import { AboutDevicesController } from './about-devices.controller';
import { AboutDevicesService } from './about-devices.service';

describe('AboutDevicesController', () => {
  let controller: AboutDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AboutDevicesController],
      providers: [AboutDevicesService],
    }).compile();

    controller = module.get<AboutDevicesController>(AboutDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
