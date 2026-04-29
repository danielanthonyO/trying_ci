import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRepairTicketDto {
  @IsInt()
  @Min(1)
  customerId!: number;

  @IsInt()
  @Min(1)
  deviceId!: number;

  @IsString()
  problemDescription!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedWorkerId?: number;
}