import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOffDayDto } from './dto/create-off-day.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class OffDaysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOffDayDto) {
    const worker = await this.prisma.user.findUnique({
      where: { id: dto.workerId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    if (worker.role !== UserRole.WORKER) {
      throw new BadRequestException('Off day can only be assigned to a worker');
    }

    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    const existing = await this.prisma.workerOffDay.findFirst({
      where: {
        workerId: dto.workerId,
        date,
      },
    });

    if (existing) {
      throw new BadRequestException('Off day already exists for this worker on this date');
    }

    return this.prisma.workerOffDay.create({
      data: {
        workerId: dto.workerId,
        date,
        reason: dto.reason,
      },
      include: {
        worker: true,
      },
    });
  }

  findAll() {
    return this.prisma.workerOffDay.findMany({
      orderBy: { date: 'asc' },
      include: { worker: true },
    });
  }

  findByWorker(workerId: number) {
    return this.prisma.workerOffDay.findMany({
      where: { workerId },
      orderBy: { date: 'asc' },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.workerOffDay.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Off day not found');
    }

    await this.prisma.workerOffDay.delete({
      where: { id },
    });

    return { message: 'Off day deleted successfully' };
  }
}