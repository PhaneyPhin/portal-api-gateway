import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ValidateTokenRequestDto {
  @ApiProperty()
  @IsOptional()
  readonly authToken: string;

  @ApiProperty({ example: "caminv01" })
  @IsOptional()
  readonly username: string;

  @ApiProperty({ example: "abc12345" })
  @IsOptional()
  readonly password: string;
}
