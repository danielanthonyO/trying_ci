import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
    service.$connect = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('connects on module init', async () => {
    await service.onModuleInit();

    expect(service.$connect).toHaveBeenCalled();
  });
});