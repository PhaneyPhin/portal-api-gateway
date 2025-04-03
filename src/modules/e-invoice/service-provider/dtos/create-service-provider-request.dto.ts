import { IsNotEmpty, MaxLength } from "class-validator";

export class CreateServiceProviderRequestDto {
  @IsNotEmpty()
  @MaxLength(160)
  name_en: string;

  @IsNotEmpty()
  @MaxLength(160)
  name_kh: string;

  @IsNotEmpty()
  @MaxLength(160)
  logo: string;

  @IsNotEmpty()
  @MaxLength(160)
  description: string;

  createdBy: string;
}
