import { BaseCrudService } from "@common/services/base-crud.service";
import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { InvoiceProcessorService } from "@modules/e-invoice/invoiceprocessor/invoiceprocessor.service";
import { ExchangeRateService } from "@modules/exchange-rate/exchange-rate.service";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { Repository } from "typeorm";
import { CreditNoteXmlHelperService } from "./credit-note-xml-helper.servoice";
import { DebitNoteUBMLXMLHelper } from "./debit-note-xml-helper.servoice";
import { DocumentEntity } from "./document.entity";
import { InvoiceDto } from "./dto/create-invoice.dto";
import { CreditNoteDto } from "./dto/credit-note.dto";
import { DebitNoteDto } from "./dto/debit-note.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { DocumentType } from "./enums/DocumentType";
import { InvoiceUBLXMLHelperService } from "./invoice-ubl-xml-helper.service";
import { UBLHelperService } from "./ubl-helper.service";

@Injectable()
export class DocumentService extends BaseCrudService {
  protected queryName: string = "document";
  protected FILTER_FIELDS: string[] = ["status", "supplier_id", "customer_id"];

  protected SEARCH_FIELDS: string[] = [
    "customer.entity_name_en",
    "customer.entity_name_kh",
    "document.document_number",
    "customer.tin",
  ];
  private readonly ublExtractorService: InvoiceUBLXMLHelperService;

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly ublHelperService: UBLHelperService,
    private readonly invoiceProcessorService: InvoiceProcessorService,
    private readonly invoiceUblExtractorService: InvoiceUBLXMLHelperService,
    private readonly creditNoteUblExtractorService: CreditNoteXmlHelperService,
    private readonly debitNoteUblExtractorService: DebitNoteUBMLXMLHelper,
    private readonly exchangeRateService: ExchangeRateService
  ) {
    super();
  }

  protected getFilters() {
    return {
      document_type: (query, value) => {
        return query.andWhere(`document_type IN (:...document_type)`, {
          document_type: value,
        });
      },
    };
  }

  protected getMapperResponseEntityFields() {
    return (a) => a;
  }

  protected getListQuery() {
    return this.documentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.customer", "customer");
  }

  async create(document: InvoiceDto | CreditNoteDto | DebitNoteDto) {
    let documentEntity;

    const exchageRateResult =
      await this.exchangeRateService.getExchangeRateOnDate(document.issue_date);
    document.exchange_rate = exchageRateResult.rate;
    if (document.is_draft) {
      document.status = "DRAFT";
    } else {
      document.status = "POSTED";

      this.ublHelperService.fillInvoiceInformation(document);
    }

    if (document.document_id) {
      documentEntity = await this.documentRepository.findOneBy({
        document_id: document.document_id,
      });

      documentEntity = this.documentRepository.merge(documentEntity, document);
    } else {
      documentEntity = this.documentRepository.create(document);
    }

    return await this.documentRepository.save(documentEntity);
  }

  async update(
    documentId: UUID,
    document: InvoiceDto | CreditNoteDto | DebitNoteDto
  ) {
    let documentEntity;

    const exchageRateResult =
      await this.exchangeRateService.getExchangeRateOnDate(document.issue_date);
    document.exchange_rate = exchageRateResult.rate;

    if (document.is_draft) {
      document.status = "DRAFT";
    } else {
      document.status = "POSTED";
    }

    documentEntity = await this.documentRepository.findOneBy({
      document_id: documentId,
    });

    documentEntity = this.documentRepository.merge(documentEntity, document);

    return await this.documentRepository.save(documentEntity);
  }

  async findById(id: UUID) {
    const document = await this.documentRepository.findOne({
      where: { document_id: id },
      relations: ["customer"],
    });

    return document;
  }

  public async submitDocument(
    document: DocumentEntity,
    supplier: BusinessResponseDto
  ): Promise<DocumentResponseDto> {
    if (document.status !== "POSTED") {
      throw new BadRequestException(
        "Document must be posted before submission"
      );
    }
    const xml = this.ublHelperService.toUBL({
      ...document,
      issue_date: document.issue_date || new Date(),
      supplier,
    });

    const base64Xml = Buffer.from(xml).toString("base64");
    const result = await this.invoiceProcessorService.submitDocument({
      document: base64Xml,
      created_by: "E_INVOICE_PORTAL",
      document_type: document.document_type,
      supplier_id: supplier.endpoint_id,
    });

    await this.remove(document.document_id);

    return result;
  }

  async remove(id: string) {
    return await this.documentRepository.delete({ document_id: id });
  }

  async getEInvoiceDetail(
    document: DocumentEntity,
    supplier: BusinessResponseDto
  ) {
    const xml = this.ublHelperService.toUBL({
      ...document,
      supplier,
    });

    let ublExtractor = null;
    switch (document.document_type) {
      case DocumentType.INVOICE:
        ublExtractor = this.invoiceUblExtractorService.parseXML(xml);
        break;
      case DocumentType.CREDIT_NOTE:
        ublExtractor = this.creditNoteUblExtractorService.parseXML(xml);
        break;
      case DocumentType.DEBIT_NOTE:
        ublExtractor = this.debitNoteUblExtractorService.parseXML(xml);
        break;
      default:
        throw new NotFoundException();
    }

    // Check which columns should be displayed
    const hasDiscount = ublExtractor.invoice_lines.some((line) =>
      line.allowance_charges?.some(
        (charge) => charge.charge_indicator === false
      )
    );

    const hasSPT = ublExtractor.invoice_lines.some((line) =>
      line.tax?.tax_subtotals?.some(
        (tax) => tax.tax_category.tax_scheme === "SP"
      )
    );

    const hasPLT = ublExtractor.invoice_lines.some((line) =>
      line.tax?.tax_subtotals?.some(
        (tax) => tax.tax_category.tax_scheme === "PLT"
      )
    );

    const hasAT = ublExtractor.invoice_lines.some((line) =>
      line.tax?.tax_subtotals?.some(
        (tax) => tax.tax_category.tax_scheme === "AT"
      )
    );

    const hasVAT = ublExtractor.invoice_lines.some((line) =>
      line.tax?.tax_subtotals?.some(
        (tax) => tax.tax_category.tax_scheme === "VAT"
      )
    );

    // Add display information
    ublExtractor.display_columns = {
      has_discount: hasDiscount,
      has_specific_tax: hasSPT,
      has_plt_tax: hasPLT,
      has_accom_tax: hasAT,
      has_vat: hasVAT,
    };

    // Transform invoice lines with computed fields
    ublExtractor.invoice_lines = ublExtractor.invoice_lines.map(
      (line, index) => {
        const discountCharge = line.allowance_charges?.find(
          (allowanceCharge) => allowanceCharge.charge_indicator === false
        );

        // Find tax amounts for each type
        const sptTax = line.tax?.tax_subtotals?.find(
          (tax) => tax.tax_category.tax_scheme === "SP"
        );
        const pltTax = line.tax?.tax_subtotals?.find(
          (tax) => tax.tax_category.tax_scheme === "PLT"
        );
        const atTax = line.tax?.tax_subtotals?.find(
          (tax) => tax.tax_category.tax_scheme === "AT"
        );
        const vatTax = line.tax?.tax_subtotals?.find(
          (tax) => tax.tax_category.tax_scheme === "VAT"
        );

        // Calculate display fields
        const display = {
          no: (index + 1).toString(),
          description: line.item.description || line.item.name,
          qty: line.quantity,
          unit_price: line.price,
          amount_excl: line.line_extension_amount,
          amount_incl: line.line_extension_amount + (line.tax?.tax_amount || 0),
        } as any;

        // Only add fields that exist
        if (hasDiscount) {
          display.discount = discountCharge?.amount || 0;
        }
        if (hasSPT) {
          display.specific_tax = sptTax?.tax_amount || 0;
        }
        if (hasPLT) {
          display.plt_tax = pltTax?.tax_amount || 0;
        }
        if (hasAT) {
          display.accom_tax = atTax?.tax_amount || 0;
        }
        if (hasVAT) {
          display.vat = vatTax?.tax_amount || 0;
        }

        return {
          ...line,
          display,
        };
      }
    );

    return {
      ...ublExtractor,
      document_id: document.document_id,
      payment_term: document.payment_term,
      sub_total: document.sub_total,
      note: document.note,
      exchange_rate: document.exchange_rate,
      status: document.status,
      document_type: document.document_type,
      invoice_type_code: document.invoice_type_code,
      tax_total: document.tax_total,
    };
  }

  async createDocumentLog(data: {
    document_id: string;
    action: string;
    user_id: string;
    full_name: string;
    description: string;
    document_type: "document" | "received_document";
    is_system?: boolean;
    actor_type?: "supplier" | "customer";
  }): Promise<void> {
    // If it's a system action, use system as the actor
    if (data.is_system) {
      data.user_id = "SYSTEM";
      data.full_name = "System";
    }

    // If it's a customer action, mask the supplier name
    if (data.actor_type === "customer") {
      data.full_name = "Customer";
    }

    // If it's a supplier action, mask the customer name
    if (data.actor_type === "supplier") {
      data.full_name = "Supplier";
    }

    await this.invoiceProcessorService.emit(
      "invoice-processor.document-log.create",
      data
    );
  }
}
