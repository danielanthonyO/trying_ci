import { Test, TestingModule } from '@nestjs/testing';
import { RepairTicketsController } from './repair-tickets.controller';
import { RepairTicketsService } from './repair-tickets.service';

describe('RepairTicketsController', () => {
  let controller: RepairTicketsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairTicketsController],
      providers: [{ provide: RepairTicketsService, useValue: mockService }],
    }).compile();

    controller = module.get<RepairTicketsController>(RepairTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});