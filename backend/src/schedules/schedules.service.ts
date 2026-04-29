import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: dto.ticketId },
      include: {
        customer: true,
        device: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found');
    }

    const worker = await this.prisma.user.findUnique({
      where: { id: dto.workerId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    if (worker.role !== UserRole.WORKER) {
      throw new BadRequestException('Assigned user must have WORKER role');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }

    const startOfDay = new Date(startTime);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const offDay = await this.prisma.workerOffDay.findFirst({
      where: {
        workerId: dto.workerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (offDay) {
      throw new BadRequestException('This worker is off on the selected date');
    }

    const overlap = await this.prisma.schedule.findFirst({
      where: {
        workerId: dto.workerId,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException(
        'This worker already has a schedule in the selected time range',
      );
    }

    return this.prisma.schedule.create({
      data: {
        ticketId: dto.ticketId,
        workerId: dto.workerId,
        startTime,
        endTime,
        note: dto.note,
      },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });
  }

  findAll() {
    return this.prisma.schedule.findMany({
      orderBy: {
        startTime: 'asc',
      },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async findByWorker(workerId: number) {
    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    return this.prisma.schedule.findMany({
      where: { workerId },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });
  }

  async findByWorkerAndRange(workerId: number, start: string, end: string) {
    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    return this.prisma.schedule.findMany({
      where: {
        workerId,
        AND: [
          { startTime: { lt: endDate } },
          { endTime: { gt: startDate } },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });
  }

  async update(id: number, dto: UpdateScheduleDto) {
    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Schedule not found');
    }

    const ticketId = dto.ticketId ?? existing.ticketId;
    const workerId = dto.workerId ?? existing.workerId;
    const startTime = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }

    const startOfDay = new Date(startTime);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const offDay = await this.prisma.workerOffDay.findFirst({
      where: {
        workerId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (offDay) {
      throw new BadRequestException('This worker is off on the selected date');
    }

    const worker = await this.prisma.user.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    if (worker.role !== UserRole.WORKER) {
      throw new BadRequestException('Assigned user must have WORKER role');
    }

    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found');
    }

    const overlap = await this.prisma.schedule.findFirst({
      where: {
        workerId,
        id: { not: id },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException(
        'This worker already has a schedule in the selected time range',
      );
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ticketId,
        workerId,
        startTime,
        endTime,
        note: dto.note ?? existing.note,
      },
      include: {
        ticket: {
          include: {
            customer: true,
            device: true,
          },
        },
        worker: true,
      },
    });
  }

  async remove(id: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.prisma.schedule.delete({
      where: { id },
    });

    return { message: 'Schedule deleted successfully' };
  }
}