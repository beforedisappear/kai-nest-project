import { v4 as uuidv4 } from 'uuid';

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/create-user.dto';

import { Cache } from 'cache-manager';

import type { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    //create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PrismaService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    //get instance of every service from testing module
    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('should create a new user with hashed password', async () => {
      const mockUserDto: CreateUserDto = {
        phoneNumber: '+79378778444',
        password: 'password123',
      };

      const mockHashedPassword = 'hashedPassword123';

      const mockUser: User = {
        id: uuidv4(),
        phoneNumber: mockUserDto.phoneNumber,
        password: mockHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hashPasswordSpy = jest
        .spyOn(service, 'hashPassword')
        .mockReturnValue(mockHashedPassword);

      //мокаем метод create объекта prismaService.user и устанавливаем его возвращаемое значение
      const prismaCreateSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce(mockUser);

      await service.save(mockUserDto);

      //ожидаем что метод hashPassword был вызван с заданным паролем
      expect(hashPasswordSpy).toHaveBeenCalledWith(mockUserDto.password);

      //ожидаем что метод создания пользователя был вызван с заданными данными
      expect(prismaCreateSpy).toHaveBeenCalledWith({
        data: {
          phoneNumber: mockUserDto.phoneNumber,
          password: mockHashedPassword,
        },
      });
    });

    //if  phone number is already registered save always throw error
    //checking placed in auth service
  });

  describe('findOne', () => {
    it('should return cached user if found in cache', async () => {
      const idOrPhoneNumber = '+79378778444';

      const mockCachedUser: User = {
        id: uuidv4(),
        phoneNumber: idOrPhoneNumber,
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cacheGetSpy = jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(mockCachedUser);

      const prismaFindFirstSpy = jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(mockCachedUser);

      const result = await service.findOne(idOrPhoneNumber);

      expect(result).toEqual(mockCachedUser);
      expect(cacheGetSpy).toHaveBeenCalledWith(idOrPhoneNumber);
      expect(prismaFindFirstSpy).not.toHaveBeenCalled();
    });

    it('should return user from database if not found in cache', async () => {
      const idOrPhoneNumber = uuidv4();

      const mockUser: User = {
        id: idOrPhoneNumber,
        phoneNumber: '+79378778444',
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cacheGetSpy = jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(null);

      const prismaFindFirstSpy = jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(mockUser);

      // Act
      const result = await service.findOne(idOrPhoneNumber);

      expect(result).toEqual(mockUser);
      expect(cacheGetSpy).toHaveBeenCalledWith(idOrPhoneNumber);
      expect(prismaFindFirstSpy).toHaveBeenCalledWith({
        where: {
          OR: [{ id: idOrPhoneNumber }, { phoneNumber: idOrPhoneNumber }],
        },
      });
    });

    it('should return null if user is not found in cache or database', async () => {
      const idOrPhoneNumber = '+79378778444';

      const cacheGetSpy = jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValueOnce(null);

      const prismaFindFirstSpy = jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValueOnce(null);

      const result = await service.findOne(idOrPhoneNumber);

      expect(result).toBeNull();
      expect(cacheGetSpy).toHaveBeenCalledWith(idOrPhoneNumber);
      expect(prismaFindFirstSpy).toHaveBeenCalledWith({
        where: {
          OR: [{ id: idOrPhoneNumber }, { phoneNumber: idOrPhoneNumber }],
        },
      });
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user if user with the given id exists', async () => {
      const userId = uuidv4();

      const mockUser: User = {
        id: userId,
        phoneNumber: '+79378778444',
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prismaDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValueOnce(mockUser);

      const result = await service.delete(userId);

      expect(result).toEqual(mockUser);
      expect(prismaDeleteSpy).toHaveBeenCalledWith(userId);
    });

    it('should return null if user with the given id does not exist', async () => {
      const userId = uuidv4();

      const prismaDeleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValue(null);

      const result = await service.delete(userId);

      expect(result).toBeNull();
      expect(prismaDeleteSpy).toHaveBeenCalledWith(userId);
    });
  });
});
