import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, ValidateNested } from "class-validator";

class PaginationMetaDto {
  @ApiProperty()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  total_counts: any; // You can change to @IsNumber() if known to be a number

  @ApiProperty()
  @IsBoolean()
  has_next: boolean;

  @ApiProperty()
  @IsNumber()
  total_pages: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // Replace Object with your actual model class if possible
  data: T[];

  @ApiProperty({ type: () => PaginationMetaDto })
  @ValidateNested()
  @Type(() => PaginationMetaDto)
  pagination: PaginationMetaDto;
}
