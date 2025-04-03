import { IsNotEmpty, IsString } from "class-validator";

export class GDTKYBRequest {
  @IsString()
  @IsNotEmpty()
  company_name_kh: string;

  @IsString()
  @IsNotEmpty()
  company_name_en: string;

  @IsString()
  @IsNotEmpty()
  tin: string;
}

export class MOCKYBRequest extends GDTKYBRequest {
  @IsString()
  @IsNotEmpty()
  single_id: string;
}
