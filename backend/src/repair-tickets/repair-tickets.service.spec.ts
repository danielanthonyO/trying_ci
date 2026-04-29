import { Test, TestingModule } from '@nestjs/testing';
import { RepairTicketsService } from './repair-tickets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RepairTicketsService', () => {
  let service: RepairTicketsService;

  const mockPrisma = {
    repairTicket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticketHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairTicketsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RepairTicketsService>(RepairTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});