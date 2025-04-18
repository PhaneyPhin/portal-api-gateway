import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InvoiceMailDto {
  @Expose()
  @IsNotEmpty()
  @IsEmail({ ignore_max_length: true })
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  document_id: string;

  @Expose()
  @IsOptional()
  @IsString()
  note: string;
}
