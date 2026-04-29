import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartDto) {
    const ticket = await this.prisma.repairTicket.findUnique({
      where: { id: dto.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Repair ticket not found');
    }

    return this.prisma.part.create({
      data: {
        name: dto.name,
        price: dto.price,
        quantity: dto.quantity,
        ticketId: dto.ticketId,
      },
    });
  }

  async findByTicket(ticketId: number) {
    return this.prisma.part.findMany({
      where: { ticketId },
    });
  }

  async remove(id: number) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    await this.prisma.part.delete({
      where: { id },
    });

    return { message: 'Part deleted' };
  }
}