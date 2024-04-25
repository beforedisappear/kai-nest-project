import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { LoginDto, LogoutDto, RefreshTokensDto, RegisterDto } from './dto';

import { v4 as uuidv4 } from 'uuid';

import { JWT, User } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

interface expectedTokens {
  accessToken: string;
  refreshToken: JWT;
}

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        PrismaService,
        JwtService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        phoneNumber: '1234567890',
        password: 'password',
        passwordRepeat: 'password',
      };

      const mockHashedPassword = 'hashedPassword123';

      const expectedUser: User = {
        id: uuidv4(),
        phoneNumber: dto.password,
        password: mockHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'save').mockResolvedValue(expectedUser);

      const result = await authService.register(dto);

      expect(result).toEqual(expectedUser);
      expect(userService.findOne).toHaveBeenCalledWith(dto.phoneNumber);
      expect(userService.save).toHaveBeenCalledWith(dto);
    });

    it('should throw conflict exception if user already exists', async () => {
      const userPhoneNumber = '+79378778444';

      const dto: RegisterDto = {
        phoneNumber: userPhoneNumber,
        password: 'password',
        passwordRepeat: 'password',
      };

      const existingUser: User = {
        id: uuidv4(),
        phoneNumber: dto.password,
        password: userPhoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(existingUser);

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findOne).toHaveBeenCalledWith(userPhoneNumber);
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      const dto: LoginDto = {
        phoneNumber: '+79378778444',
        password: 'password',
      };

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const userId = uuidv4();

      const expectedUser: User = {
        id: userId,
        phoneNumber: dto.password,
        password: userService.hashPassword(dto.password),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedTokens: expectedTokens = {
        accessToken: 'some_access_token',
        refreshToken: { token: uuidv4(), exp: new Date(), userId, userAgent },
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(expectedUser);
      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue(expectedTokens);

      const result = await authService.login(dto, userAgent);

      expect(result).toEqual(expectedTokens);
      expect(userService.findOne).toHaveBeenCalledWith(dto.phoneNumber, true);
      expect(authService.generateTokens).toHaveBeenCalledWith(
        expectedUser,
        userAgent,
      );
    });

    it('should throw BadRequestException if credentials are invalid', async () => {
      const dto: LoginDto = {
        phoneNumber: '+79378778444',
        password: 'password',
      };

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(authService.login(dto, userAgent)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOne).toHaveBeenCalledWith(dto.phoneNumber, true);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens and return new tokens', async () => {
      const dto: RefreshTokensDto = { refreshToken: uuidv4() };

      const after30Days = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      const userId = uuidv4();

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const expectedUser: User = {
        id: userId,
        phoneNumber: '+79378778444',
        password: 'pasword111222333',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const oldTokens: expectedTokens = {
        accessToken: 'some_expired_access_token',
        refreshToken: {
          token: dto.refreshToken,
          exp: after30Days,
          userAgent,
          userId,
        },
      };

      const expectedTokens: expectedTokens = {
        accessToken: 'some_new_access_token',
        refreshToken: {
          token: uuidv4(),
          exp: after30Days,
          userAgent,
          userId,
        },
      };

      jest
        .spyOn(prismaService.jWT, 'delete')
        .mockResolvedValue(oldTokens.refreshToken);

      jest
        .spyOn(prismaService.jWT, 'findFirst')
        .mockResolvedValue(expectedTokens.refreshToken);

      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue(expectedTokens);

      jest.spyOn(userService, 'findOne').mockResolvedValue(expectedUser);

      const result = await authService.refreshTokens(dto, userAgent);

      expect(result).toEqual(expectedTokens);
      expect(prismaService.jWT.delete).toHaveBeenCalledWith({
        where: { token: dto.refreshToken },
      });
      expect(authService.generateTokens).toHaveBeenCalledWith(
        expectedUser,
        userAgent,
      );
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const dto: RefreshTokensDto = { refreshToken: uuidv4() };

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      jest.spyOn(prismaService.jWT, 'delete').mockResolvedValue(null);

      await expect(authService.refreshTokens(dto, userAgent)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(prismaService.jWT.delete).toHaveBeenCalledWith({
        where: { token: dto.refreshToken },
      });
    });
  });

  describe('logout', () => {
    it('should logout and delete refresh token', async () => {
      const dto: LogoutDto = { refreshToken: uuidv4() };

      const after30Days = new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
      );

      const userId = uuidv4();

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

      const expectedTokens: expectedTokens = {
        accessToken: 'some_new_access_token',
        refreshToken: {
          token: uuidv4(),
          exp: after30Days,
          userAgent,
          userId,
        },
      };

      jest
        .spyOn(prismaService.jWT, 'findFirst')
        .mockResolvedValue(expectedTokens.refreshToken);

      jest
        .spyOn(prismaService.jWT, 'delete')
        .mockResolvedValue(expectedTokens.refreshToken);

      const result = await authService.logout(dto);

      expect(result).toBeNull();
      expect(prismaService.jWT.findFirst).toHaveBeenCalledWith({
        where: { token: dto.refreshToken },
      });
      expect(prismaService.jWT.delete).toHaveBeenCalledWith({
        where: { token: dto.refreshToken },
      });
    });

    it('should throw BadRequestException if refresh token is not found', async () => {
      const dto: LogoutDto = { refreshToken: uuidv4() };

      jest.spyOn(prismaService.jWT, 'findFirst').mockResolvedValue(null);

      await expect(authService.logout(dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prismaService.jWT.findFirst).toHaveBeenCalledWith({
        where: { token: dto.refreshToken },
      });
    });
  });
});
