import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrisma = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a customer', async () => {
    mockPrisma.customer.create.mockResolvedValue({ id: 1, name: 'John' });

    const result = await service.create({ name: 'John' } as any);

    expect(prisma.customer.create).toHaveBeenCalled();
    expect(result.name).toBe('John');
  });

  it('should return all customers', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await service.findAll();

    expect(result.length).toBeGreaterThan(0);
  });
});