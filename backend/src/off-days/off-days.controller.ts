import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OffDaysService } from './off-days.service';
import { CreateOffDayDto } from './dto/create-off-day.dto';

@Controller('off-days')
export class OffDaysController {
  constructor(private readonly offDaysService: OffDaysService) {}

  @Post()
  create(@Body() dto: CreateOffDayDto) {
    return this.offDaysService.create(dto);
  }

  @Get()
  findAll() {
    return this.offDaysService.findAll();
  }

  @Get('worker/:workerId')
  findByWorker(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.offDaysService.findByWorker(workerId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.offDaysService.remove(id);
  }
}
