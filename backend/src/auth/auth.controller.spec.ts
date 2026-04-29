import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers a user', async () => {
    mockAuthService.register.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      role: UserRole.WORKER,
    });

    const result = await controller.register({
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.WORKER,
    });

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.WORKER,
    });

    expect(result.email).toBe('test@example.com');
  });

  it('logs in a user', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'mock-token',
    });

    const result = await controller.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ access_token: 'mock-token' });
  });

  it('returns current user from request', () => {
    const req = {
      user: {
        id: 1,
        email: 'test@example.com',
        role: UserRole.WORKER,
      },
    };

    expect(controller.me(req)).toEqual(req.user);
  });
});