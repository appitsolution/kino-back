import { Test, TestingModule } from '@nestjs/testing';
import { AdmininstrationController } from './admininstration.controller';
import { AdmininstrationService } from './admininstration.service';

describe('AdmininstrationController', () => {
  let controller: AdmininstrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdmininstrationController],
      providers: [AdmininstrationService],
    }).compile();

    controller = module.get<AdmininstrationController>(AdmininstrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
