import { Test, TestingModule } from '@nestjs/testing';
import { AboutDevicesService } from './about-devices.service';

describe('AboutDevicesService', () => {
  let service: AboutDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AboutDevicesService],
    }).compile();

    service = module.get<AboutDevicesService>(AboutDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
