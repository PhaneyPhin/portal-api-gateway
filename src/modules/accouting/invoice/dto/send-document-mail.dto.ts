import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class SendDocumentMailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({ ignore_max_length: true })
  email: string;

  @ApiProperty()
  @IsOptional()
  note: string;
}
