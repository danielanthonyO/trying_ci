import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOffDayDto {
  @IsInt()
  @Min(1)
  workerId!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}