export class PDFRequestDto {
  document: string;
  document_type: string;
  document_id: string;
  logoUrl: string;
}
export class PDFResponseDto {
  status: string;
  message: string;
  data: string;
}

export class PDFResponseErrorDto {
  status: string;
  message: string;
  error: string;
}
