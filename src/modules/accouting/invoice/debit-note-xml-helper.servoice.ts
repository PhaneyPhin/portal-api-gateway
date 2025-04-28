import { Injectable } from "@nestjs/common";
import { InvoiceUBLXMLHelperService } from "./invoice-ubl-xml-helper.service";

@Injectable()
export class DebitNoteUBMLXMLHelper extends InvoiceUBLXMLHelperService {
  protected DOCUMENT_KEY = "DebitNote";
  protected DOCUMENT_TYPE_CODE = "DebitNoteTypeCode";
  protected DOCUMENT_LINE = "CreditNoteLine";
}
