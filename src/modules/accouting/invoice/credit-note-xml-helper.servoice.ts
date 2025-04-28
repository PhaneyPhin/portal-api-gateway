import { Injectable } from "@nestjs/common";
import { InvoiceUBLXMLHelperService } from "./invoice-ubl-xml-helper.service";

@Injectable()
export class CreditNoteXmlHelperService extends InvoiceUBLXMLHelperService {
  protected DOCUMENT_KEY = "CreditNote";
  protected DOCUMENT_TYPE_CODE = "CreditNoteTypeCode";
  protected DOCUMENT_LINE = "CreditNoteLine";
}
