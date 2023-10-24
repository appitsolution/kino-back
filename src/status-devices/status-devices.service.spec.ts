import { Test, TestingModule } from '@nestjs/testing';
import { StatusDevicesService } from './status-devices.service';

describe('StatusDevicesService', () => {
  let service: StatusDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusDevicesService],
    }).compile();

    service = module.get<StatusDevicesService>(StatusDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
