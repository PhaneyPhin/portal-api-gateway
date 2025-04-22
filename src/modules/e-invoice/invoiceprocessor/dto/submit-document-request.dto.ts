import { DocumentType } from "@modules/accouting/invoice/enums/DocumentType";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class SubmitDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty()
  @IsNotEmpty()
  document_type: DocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplier_id: string;

  created_by: 'E_INVOICE_PORTAL'
}

export class SubmitDocumentsRequestDto {
  @ApiProperty({ type: [SubmitDocumentDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubmitDocumentDto)
  documents: SubmitDocumentDto[];
}
