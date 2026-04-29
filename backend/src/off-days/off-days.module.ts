import { Module } from '@nestjs/common';
import { OffDaysController } from './off-days.controller';
import { OffDaysService } from './off-days.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OffDaysController],
  providers: [OffDaysService, PrismaService],
})
export class OffDaysModule {}