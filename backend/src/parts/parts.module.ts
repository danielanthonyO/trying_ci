import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PartsController],
  providers: [PartsService, PrismaService],
})
export class PartsModule {}