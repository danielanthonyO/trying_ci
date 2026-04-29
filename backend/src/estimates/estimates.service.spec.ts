import { Test, TestingModule } from '@nestjs/testing';
import { EstimatesService } from './estimates.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('EstimatesService', () => {
  let service: EstimatesService;

  const mockPrisma = {
    costEstimate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEmailService = {
    sendMail: jest.fn(),
    sendEstimateEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstimatesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<EstimatesService>(EstimatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});