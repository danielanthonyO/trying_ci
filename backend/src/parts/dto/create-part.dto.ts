import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(1)
  ticketId!: number;
}