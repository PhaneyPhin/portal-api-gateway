import { IsBoolean, IsNotEmpty, MaxLength } from "class-validator";
import { CreateServiceProviderRequestDto } from "./create-service-provider-request.dto";

export class UpdateServiceProviderRequestDto extends CreateServiceProviderRequestDto {
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

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  updatedBy: string;
}
