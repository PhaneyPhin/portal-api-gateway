import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PDFRequestDto } from "./dto/pdf-request.dto";
@Injectable()
export class ConverterService {
  private URL = "";
  constructor(private readonly configService: ConfigService) {
    this.URL = this.configService.get("CONVERTER_URL", "http://localhost:4000");
  }

  async getPdf(data: PDFRequestDto) {
    try {
      const result = await axios.post(
        this.URL + "/generate-pdf",
        {
          qr_content: `${this.configService.get(
            "CAMINV_URL",
            "https://portal.e-invoice.gov.kh"
          )}/verification?data=${data.document_id}`,
          logo: data.logoUrl,
          document: Buffer.from(data.document).toString("base64"),
          document_type: data.document_type,
          document_id: data.document_id,
        },
        { responseType: "arraybuffer" }
      );

      return result?.data;
    } catch (e) {
      throw new UnprocessableEntityException({
        code: 422,
        data: e.response.data,
      });
    }
  }
}
