import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEstimateDto {
  @IsInt()
  @Min(1)
  ticketId!: number;

  @IsNumber()
  @Min(0)
  laborCost!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}