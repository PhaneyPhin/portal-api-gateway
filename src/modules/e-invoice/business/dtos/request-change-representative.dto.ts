import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RequestChangeRepresentativeDto {
  @ApiProperty({
    description: "National identity number",
    example: "N044634355434",
  })
  @IsString()
  requestedToPersonalCode: string;

  @ApiProperty({
    description: "Reason for the representative request",
    maxLength: 500,
    example: "Requesting permission for financial report submission.",
  })
  @IsString()
  @Length(1, 500)
  reason: string;

  @ApiProperty({
    description: "Filename or reference to the authorized letter",
    maxLength: 200,
    example: "authorized_letter_2024.pdf",
  })
  @IsString()
  @Length(1, 200)
  authorizedLetter: string;

  @ApiProperty({
    description: "endpoint id ",
    maxLength: 200,
    example: "KHUID001",
  })
  @IsString()
  endpoint_id: string;
}
