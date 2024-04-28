import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BannerService {
  constructor(private readonly prismaService: PrismaService) {}

  getAll() {
    return this.prismaService.banner.findMany();
  }
}
