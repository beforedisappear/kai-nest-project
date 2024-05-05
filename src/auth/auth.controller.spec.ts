import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshTokensDto, RegisterDto } from './dto';
import { JWT, User } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';
import { UserResponse } from '@/user/dto/user-response.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

interface expectedTokens {
  accessToken: string;
  refreshToken: JWT;
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        JwtService,
        PrismaService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        phoneNumber: '1234567890',
        password: 'password',
        passwordRepeat: 'password',
      };

      const mockHashedPassword = 'hashedPassword123';

      const mockUser: User = {
        id: uuidv4(),
        phoneNumber: dto.password,
        password: mockHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'register').mockResolvedValue(mockUser);

      const result = await controller.register(dto);

      expect(result).toBeInstanceOf(UserResponse);
      expect(result).toEqual(new UserResponse(mockUser));
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('should throw bad request exception if user already exists', async () => {
      const dto: RegisterDto = {
        phoneNumber: '1234567890',
        password: 'password',
        passwordRepeat: 'password',
      };

      jest.spyOn(service, 'register').mockResolvedValue(null);

      await expect(controller.register(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      const dto: LoginDto = {
        phoneNumber: '+79378778444',
        password: 'password',
      };

      const userId = uuidv4();

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const after30Days = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      const expectedTokens: expectedTokens = {
        accessToken: 'some_new_access_token',
        refreshToken: {
          token: uuidv4(),
          exp: after30Days,
          userAgent,
          userId,
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(expectedTokens);

      const result = await controller.login(dto, userAgent);

      expect(result).toEqual({
        accessToken: expectedTokens.accessToken,
        exp: expectedTokens.refreshToken.exp,
        refreshToken: expectedTokens.refreshToken.token,
      });
      expect(service.login).toHaveBeenCalledWith(dto, userAgent);
    });

    it('should throw bad request exception if credentials are invalid', async () => {
      const dto: LoginDto = {
        phoneNumber: '+79378778444',
        password: 'password',
      };

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      jest.spyOn(service, 'login').mockResolvedValue(null);

      await expect(controller.login(dto, userAgent)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.login).toHaveBeenCalledWith(dto, userAgent);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const dto: RefreshTokensDto = { refreshToken: uuidv4() };
      const agent = 'test-agent';

      const userId = uuidv4();

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const mockTokens: expectedTokens = {
        accessToken: 'some_new_access_token',
        refreshToken: {
          token: uuidv4(),
          exp: new Date(), //expired
          userAgent,
          userId,
        },
      };

      jest.spyOn(service, 'refreshTokens').mockResolvedValue(mockTokens);

      const result = await controller.refreshTokens(dto, agent);

      expect(result).toEqual(mockTokens);
      expect(service.refreshTokens).toHaveBeenCalledWith(dto, agent);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const dto: RefreshTokensDto = { refreshToken: uuidv4() };

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      jest
        .spyOn(service, 'refreshTokens')
        .mockRejectedValue(new UnauthorizedException());

      await expect(controller.refreshTokens(dto, userAgent)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(service.refreshTokens).toHaveBeenCalledWith(dto, userAgent);
    });
  });

  describe('logout', () => {
    it('should logout', async () => {
      const dto: LogoutDto = { refreshToken: uuidv4() };

      jest.spyOn(service, 'logout').mockResolvedValue(null);

      const result = await controller.logout(dto);

      expect(result).toBeNull();
      expect(service.logout).toHaveBeenCalledWith(dto);
    });
  });
});
