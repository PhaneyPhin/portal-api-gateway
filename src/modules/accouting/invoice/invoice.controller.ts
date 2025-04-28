import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Res,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";

import { CurrentUser, TOKEN_NAME } from "@auth";
import { AuditLogService } from "@common/audit/audit.service";
import { ApiGlobalResponse } from "@common/decorators";
import { ApiFields } from "@common/decorators/api-fields.decorator";
import { SkipHttpResponse } from "@common/decorators/skip-http-response.decorator";
import {
  ApiPaginatedResponse,
  PaginationParams,
  PaginationRequest,
  PaginationResponseDto,
} from "@libs/pagination";
import { BusinessResponseDto } from "@modules/e-invoice/business/dtos";
import { ServiceAccountService } from "@modules/e-invoice/business/service-account.service";
import { ConverterService } from "@modules/e-invoice/format-converter/converter.service";
import { InvoiceProcessorService } from "@modules/e-invoice/invoiceprocessor/invoiceprocessor.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UUID } from "crypto";
import { DocumentEntity } from "./document.entity";
import { DocumentService } from "./document.service";
import { InvoiceDto } from "./dto/create-invoice.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { RejectDocumentRequest } from "./dto/reject-document.dto";
import { SendDocumentMailDto } from "./dto/send-document-mail.dto";
import { DocumentType } from "./enums/DocumentType";

@ApiTags("Invoice")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/invoice",
  version: "1",
})
export class InvoiceController {
  protected documentType = [DocumentType.INVOICE];

  constructor(
    private readonly documentService: DocumentService,
    private readonly auditService: AuditLogService,
    private readonly serviceAccountService: ServiceAccountService,
    private readonly invoiceProcessorService: InvoiceProcessorService,
    private readonly converterService: ConverterService
  ) {}

  @ApiOperation({ description: "Get paginated list of invoices" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiQuery({ name: "status", type: "string", required: false, example: "" })
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public getInvoices(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    console.log({
      ...pagination.params,
      supplier_id: user.endpoint_id,
      document_type: this.documentType,
    })
    return this.documentService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: this.documentType,
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Create new invoice" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Invoice already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post()
  public async createInvoice(
    @Body(ValidationPipe) dto: InvoiceDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const invoice = await this.documentService.create({
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: user.id,
      action: "CREATE",
      resourceId: invoice.document_id.toString(),
      resourceType: "INVOICE",
      fields: ["document_number", "document_type", "status"],
      oldData: null,
      newData: invoice,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    const supplier = await this.serviceAccountService.getBusinessProfile(user);
    if (! dto.is_draft) {
      const einvoice = await this.documentService.getEInvoiceDetail(invoice, supplier);
      return { ...einvoice, supplier: supplier, customer: invoice.customer };
    }

    invoice.supplier = supplier;
    return invoice;
  }

  @ApiOperation({ description: "Update invoice by ID" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Invoice already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/:id")
  public async updateInvoice(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: InvoiceDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const oldInvoice = await this.documentService.findById(id);
    const invoice = await this.documentService.update(id, {
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: user.id,
      action: "UPDATE",
      resourceId: invoice.document_id.toString(),
      resourceType: "INVOICE",
      fields: ["document_number", "document_type", "status"],
      oldData: oldInvoice,
      newData: invoice,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    invoice.supplier = await this.serviceAccountService.getBusinessProfile(user);
    return invoice;
  }

  @ApiOperation({ description: "Submit invoice for e-invoice processing" })
  @ApiGlobalResponse(DocumentResponseDto)
  @ApiConflictResponse({ description: "E-invoice already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post("/:id")
  public async submit(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.documentService.findById(id);
    console.log(document, user);
    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const supplier = await this.serviceAccountService.getBusinessProfile(user);
    const einvoice = await this.documentService.submitDocument(document, supplier);

    // Log audit action
    await this.auditService.logAction({
      actorId: user.id,
      action: "SUBMIT",
      resourceId: document.document_id.toString(),
      resourceType: "INVOICE",
      fields: ["document_number", "status"],
      oldData: document,
      newData: einvoice,
    });

    // Log document action
    await this.documentService.createDocumentLog({
      document_id: einvoice.document_id,
      action: "SUBMIT",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} submitted for e-invoice processing`,
      document_type: 'document'
    });

    return einvoice;
  }

  @ApiOperation({ description: "Get paginated list of e-invoices" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([
    "document_id",
    "supplier_id",
    "customer_id",
    "currency",
    "document_number",
    "document_type",
    "status",
  ])
  @ApiQuery({
    name: "issue_date",
    type: "string",
    required: false,
    description:
      "Date range in format: YYYY-MM-DD,YYYY-MM-DD (e.g., 2024-01-01,2024-12-31)",
    example: "2024-01-01,2024-12-31",
  })
  @ApiQuery({
    name: "due_date",
    type: "string",
    required: false,
    description:
      "Date range in format: YYYY-MM-DD,YYYY-MM-DD (e.g., 2024-06-01,2024-12-01)",
    example: "2024-06-01,2024-12-01",
  })
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/e-invoice")
  public getEInvoiceInvoices(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.invoiceProcessorService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: this.documentType,
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Get paginated list of received e-invoices" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([
    "document_id",
    "supplier_id",
    "customer_id",
    "currency",
    "document_number",
    "document_type",
    "status",
  ])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/e-invoice/received")
  public getReceivedEInvocie(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.invoiceProcessorService.list({
      ...pagination,
      params: {
        ...pagination.params,
        customer_id: user.endpoint_id,
        document_type: this.documentType,
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Accept e-invoice" })
  @ApiGlobalResponse(DocumentEntity)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/accept")
  public async accept(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    const acceptedDocument = await this.invoiceProcessorService.accept(id);

    // Log on customer side
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "ACCEPT",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} accepted`,
      document_type: 'received_document',
      actor_type: 'customer'
    });

    // Log on supplier side (system generated)
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "ACCEPTED",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} accepted by customer`,
      document_type: 'document',
      is_system: true
    });

    return acceptedDocument;
  }

  @ApiOperation({ description: "Send e-invoice" })
  @ApiGlobalResponse(DocumentEntity)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/send")
  public async send(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.invoiceProcessorService.findById(id);

    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    const sentDocument = await this.invoiceProcessorService.send(id);

    // Log on supplier side
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "SEND",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} sent to customer`,
      document_type: 'document',
      actor_type: 'supplier'
    });

    // Log on customer side (system generated)
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "DELIVERED",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} delivered to customer`,
      document_type: 'received_document',
      is_system: true
    });

    return sentDocument;
  }

  @ApiOperation({ description: "Send e-invoice via email" })
  @ApiGlobalResponse(DocumentEntity)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/send-email")
  public async sendEmail(
    @Param("id") id: UUID,
    @Body() data: SendDocumentMailDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<{ success: boolean; message: string }> {
    const document = await this.invoiceProcessorService.findById(id);

    console.log(document, id);
    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    this.invoiceProcessorService.emit("invoice-processor.sendEmail", {
      document_id: id,
      note: data.note,
      email: data.email,
    });


    return {
      success: true,
      message: "Document was being sent",
    };
  }

  @ApiOperation({ description: "Reject e-invoice" })
  @ApiGlobalResponse(DocumentEntity)
  @Patch("/e-invoice/:id/reject")
  public async reject(
    @Param("id") id: UUID,
    @Body() reject: RejectDocumentRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    const rejectedDocument = await this.invoiceProcessorService.reject({
      document_id: id,
      reason: reject.reason,
    });

    // Log on customer side
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "REJECT",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} rejected. Reason: ${reject.reason}`,
      document_type: 'received_document',
      actor_type: 'customer'
    });

    // Log on supplier side (system generated)
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "REJECTED",
      user_id: user.id,
      full_name: user.first_name_en + ' ' + user.last_name_en,
      description: `Invoice ${document.document_number} rejected by customer. Reason: ${reject.reason}`,
      document_type: 'document',
      is_system: true
    });

    return rejectedDocument;
  }

  @SkipHttpResponse()
  @ApiOperation({ description: "Get e-invoice XML by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/e-invoice/:id/xml")
  public async getXml(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto }
  ): Promise<DocumentEntity & { supplier: BusinessResponseDto }> {
    const document = await this.invoiceProcessorService.findById(id);

    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    const xml = await this.invoiceProcessorService.getXml(id);

    return xml;
  }

  @SkipHttpResponse()
  @ApiOperation({ description: "Get e-invoice PDF by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/e-invoice/:id/pdf")
  public async getPdf(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto },
    @Res() res: Response
  ) {
    const document = await this.invoiceProcessorService.findById(id);
    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    const xml = await this.invoiceProcessorService.getXml(id);

    const pdfBuffer = await this.converterService.getPdf({
      document: xml,
      document_id: document.document_id,
      document_type: document.document_type,
      logoUrl: user.business.logo_url,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${document.document_id}.pdf"`,
    });

    res.send(pdfBuffer);
  }

  @ApiOperation({ description: "Get e-invoice by ID" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id")
  public async getEinvoiceById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto & { document_logs: any[] }> {
    const document = await this.invoiceProcessorService.findById(id);
    if (!document || user.endpoint_id !== document.supplier.endpoint_id) {
      throw new NotFoundException();
    }

    // Get document logs for this specific document
    const documentLogs = await this.invoiceProcessorService.call('invoice-processor.document-log.findByDocumentId', {
      documentId: document.document_id,
      documentType: 'document'
    });

    return {
      ...document,
      document_logs: documentLogs
    };
  }

  @ApiOperation({ description: "Get received e-invoice by ID" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id/received")
  public async getReceivedInvoices(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto & { document_logs: any[] }> {
    const document = await this.invoiceProcessorService.findById(id);
    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    // Get document logs for this specific document
    const documentLogs = await this.invoiceProcessorService.call('invoice-processor.document-log.findByDocumentId', {
      documentId: document.document_id,
      documentType: 'received_document'
    });

    return {
      ...document,
      document_logs: documentLogs
    };
  }

  @ApiOperation({ description: "Delete invoice by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.delete")
  @Delete("/:id")
  public async delete(
    @Param("id") id: UUID,
    @CurrentUser() currentUser: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || document.supplier_id !== currentUser.endpoint_id) {
      throw new NotFoundException();
    }

    await this.documentService.remove(id);

    // Log audit action asynchronously
    this.auditService.logAction({
      actorId: currentUser.id,
      action: "DELETE",
      resourceId: document.document_id.toString(),
      resourceType: "INVOICE",
      fields: ["document_number"],
      oldData: document,
      newData: null,
    }).catch(error => {
      console.error('Failed to log audit:', error);
    });

    return document;
  }

  @ApiOperation({ description: "Get invoice by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id")
  public async getById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto }
  ): Promise<DocumentEntity & { supplier: BusinessResponseDto }> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);

    if (document.status === 'POSTED') {
      const einvoice = await this.documentService.getEInvoiceDetail(document, business);
      return { 
        ...einvoice, 
        supplier: business, 
        customer: document.customer,
      };
    }

    return { 
      ...document, 
      supplier: business
    };
  }

  @ApiOperation({ description: "Get invoice by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id/edit")
  public async editInvoiceId(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto }
  ): Promise<DocumentEntity & { supplier: BusinessResponseDto }> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);
    
    return { 
      ...document, 
      supplier: business
    };
  }
}
