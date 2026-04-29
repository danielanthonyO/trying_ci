import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  @Get('worker/:workerId')
  findByWorker(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Req() req: any,
  ) {
    if (req.user.role === 'WORKER' && req.user.id !== workerId) {
      throw new ForbiddenException('You can only view your own schedules');
    }

    return this.schedulesService.findByWorker(workerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  @Get('worker/:workerId/range')
  findByWorkerAndRange(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('start') start: string,
    @Query('end') end: string,
    @Req() req: any,
  ) {
    if (req.user.role === 'WORKER' && req.user.id !== workerId) {
      throw new ForbiddenException('You can only view your own schedules');
    }

    return this.schedulesService.findByWorkerAndRange(workerId, start, end);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const schedule = await this.schedulesService.findOne(id);

    if (req.user.role === 'WORKER' && schedule.workerId !== req.user.id) {
      throw new ForbiddenException('You can only view your own schedule');
    }

    return schedule;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }
}