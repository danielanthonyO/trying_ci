import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(1)
  ticketId!: number;

  @IsInt()
  @Min(1)
  workerId!: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsString()
  note?: string;
}