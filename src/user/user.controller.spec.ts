import { v4 as uuidv4 } from 'uuid';

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserResponse } from './responses';
import { User } from '@prisma/client';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let jwtAuthGuard: JwtAuthGuard;

  const cacheManagerMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        PrismaService,
        ConfigService,
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => false) },
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const userId = uuidv4();

      const mockUser: User = {
        id: userId,
        phoneNumber: '+79378778444',
        password: 'mockHashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockUser);

      const result = await controller.findOnerUser(userId);

      expect(new UserResponse(result)).toEqual(new UserResponse(mockUser));
      expect(findOneSpy).toHaveBeenCalledWith(userId);
    });

    it('should return unauthorized exception', async () => {
      const userId = uuidv4();

      const error = new UnauthorizedException();

      jest.spyOn(controller, 'findOnerUser').mockRejectedValue(error);

      try {
        await controller.findOnerUser(userId);
      } catch (err) {
        expect(err.status).toEqual(401);
      }
    });

    it('should return not found exception', async () => {
      const userId = uuidv4();

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOnerUser(userId)).rejects.toEqual(
        new NotFoundException(),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return this user', async () => {
      const userId = uuidv4();

      const mockUser: User = {
        id: userId,
        phoneNumber: '+79378778444',
        password: 'mockHashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(service, 'delete').mockResolvedValue(mockUser);

      const result = await controller.deleteUser(userId);

      expect(result).toBe(mockUser);
    });

    it("should return conflict exception if user doesn't exists", async () => {
      const userId = uuidv4();

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.deleteUser(userId)).rejects.toEqual(
        new ConflictException(),
      );
    });
  });
});
