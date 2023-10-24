import { Test, TestingModule } from '@nestjs/testing';
import { AdmininstrationService } from './admininstration.service';

describe('AdmininstrationService', () => {
  let service: AdmininstrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdmininstrationService],
    }).compile();

    service = module.get<AdmininstrationService>(AdmininstrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
