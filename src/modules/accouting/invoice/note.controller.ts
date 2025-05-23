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
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

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
import { InvoiceProcessorService } from "@modules/e-invoice/invoiceprocessor/invoiceprocessor.service";
import { UserResponseDto } from "@modules/e-invoice/user/dtos";
import { UUID } from "crypto";
import { DocumentEntity } from "./document.entity";
import { DocumentService } from "./document.service";
import { CreditNoteDto } from "./dto/credit-note.dto";
import { DocumentResponseDto } from "./dto/document-response.dto";
import { RejectDocumentRequest } from "./dto/reject-document.dto";
import { SendDocumentMailDto } from "./dto/send-document-mail.dto";
import { DocumentType } from "./enums/DocumentType";

@ApiTags("Note")
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "/note",
  version: "1",
})
export class NoteController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly auditLogService: AuditLogService,
    private readonly serviceAccountService: ServiceAccountService,
    private readonly invoiceProcessorService: InvoiceProcessorService
  ) {}

  @ApiOperation({ description: "Get paginated list of credit/debit notes" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields(["status", "document_number", "document_type", "customer_id"])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get()
  public getNotes(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.documentService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: pagination.params?.document_type
          ? [pagination.params.document_type]
          : [DocumentType.CREDIT_NOTE, DocumentType.DEBIT_NOTE],
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({
    description: "Get paginated list of received credit/debit notes",
  })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([])
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/received")
  public getReceivedNotes(
    @PaginationParams() pagination: PaginationRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.documentService.list({
      ...pagination,
      params: {
        ...pagination.params,
        supplier_id: user.endpoint_id,
        document_type: pagination.params?.document_type
          ? [pagination.params.document_type]
          : [DocumentType.CREDIT_NOTE, DocumentType.DEBIT_NOTE],
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Get paginated list of e-invoice notes" })
  @ApiPaginatedResponse(DocumentEntity)
  @ApiQuery({ name: "search", type: "string", required: false, example: "" })
  @ApiFields([])
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
        document_type: pagination.params?.document_type
          ? [pagination.params.document_type]
          : [DocumentType.CREDIT_NOTE, DocumentType.DEBIT_NOTE],
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Create new credit note" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Credit note already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Post("/credit-note")
  public async CreateCreditNote(
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    console.log(dto);
    const creditNote = await this.documentService.create({
      ...dto,
      document_type: DocumentType.CREDIT_NOTE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "CREATE",
      resourceId: creditNote.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["note"],
      oldData: null,
      newData: creditNote,
    });

    const supplier = await this.serviceAccountService.getBusinessProfile(user);
    if (!dto.is_draft) {
      const einvoice = await this.documentService.getEInvoiceDetail(
        creditNote,
        supplier
      );
      return { ...einvoice, supplier: supplier, customer: creditNote.customer };
    }

    return { ...creditNote, supplier: supplier };
  }

  @ApiOperation({ description: "Create new debit note" })
  @Post("/debit-note")
  public async creditDebitNote(
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const debitNote = await this.documentService.create({
      ...dto,
      document_type: DocumentType.CREDIT_NOTE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "CREATE",
      resourceId: debitNote.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["note"],
      oldData: null,
      newData: debitNote,
    });

    const supplier = await this.serviceAccountService.getBusinessProfile(user);
    if (!dto.is_draft) {
      const einvoice = await this.documentService.getEInvoiceDetail(
        debitNote,
        supplier
      );
      return { ...einvoice, supplier: supplier, customer: debitNote.customer };
    }

    return { ...debitNote, supplier: supplier };
  }

  @ApiOperation({ description: "Update credit note by ID" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Credit note already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/credit-note/:id")
  public async updateInvoice(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.update(id, {
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE",
      resourceId: creditNote.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["note"],
      oldData: null,
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
  }

  @ApiOperation({ description: "Update debit note by ID" })
  @ApiGlobalResponse(DocumentEntity)
  @ApiConflictResponse({ description: "Debit note already exists" })
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Put("/debit-note/:id")
  public async updateDebitNote(
    @Param("id") id: UUID,
    @Body(ValidationPipe) dto: CreditNoteDto,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const creditNote = await this.documentService.update(id, {
      ...dto,
      document_type: DocumentType.INVOICE,
      supplier_id: user.endpoint_id,
    });

    await this.auditLogService.logAction({
      actorId: user.id,
      action: "UPDATE",
      resourceId: creditNote.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["note"],
      oldData: null,
      newData: creditNote,
    });

    creditNote.supplier = await this.serviceAccountService.getBusinessProfile(
      user
    );

    return creditNote;
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
        document_type: [DocumentType.CREDIT_NOTE, DocumentType.DEBIT_NOTE],
      },
      order: pagination.order || { created_at: "DESC" },
    });
  }

  @ApiOperation({ description: "Get received e-invoice by ID" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id/received")
  public async getReceivedInvoices(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.invoiceProcessorService.findById(id);
    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }
    // await this.documentService.remove(id);

    return document;
  }

  @ApiOperation({
    description: "Submit credit/debit note for e-invoice processing",
  })
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

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const supplier = await this.serviceAccountService.getBusinessProfile(user);
    const einvoice = await this.documentService.submitDocument(
      document,
      supplier
    );

    // Log audit action
    await this.auditLogService.logAction({
      actorId: user.id,
      action: "SUBMIT",
      resourceId: document.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["document_number", "status"],
      oldData: document,
      newData: einvoice,
    });

    // Log document action
    await this.documentService.createDocumentLog({
      document_id: einvoice.document_id,
      action: "SUBMIT",
      user_id: user.id,
      full_name: user.first_name_en + " " + user.last_name_en,
      description: `${document.document_type} ${document.document_number} submitted for e-invoice processing`,
      document_type: "document",
    });

    return einvoice;
  }

  @ApiOperation({ description: "Delete credit/debit note by ID" })
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

    await this.auditLogService.logAction({
      actorId: currentUser.id,
      action: "DELETE",
      resourceId: document.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["note"],
      oldData: document,
      newData: null,
    });

    return document;
  }

  @ApiOperation({ description: "Accept e-invoice note" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/accept")
  public async accept(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.invoiceProcessorService.findById(id);

    if (!document || user.endpoint_id !== document.customer.endpoint_id) {
      throw new NotFoundException();
    }

    const acceptedDocument = await this.invoiceProcessorService.accept(id);

    // Log audit action
    await this.auditLogService.logAction({
      actorId: user.id,
      action: "ACCEPT",
      resourceId: document.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["status"],
      oldData: document,
      newData: acceptedDocument,
    });

    // Log document action
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "ACCEPT",
      user_id: user.id,
      full_name: user.first_name_en + " " + user.last_name_en,
      description: `${document.document_type} ${document.document_number} accepted by customer`,
      document_type: "document",
    });

    return acceptedDocument;
  }

  @ApiOperation({ description: "Send e-invoice note" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Patch("/e-invoice/:id/send")
  public async send(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto> {
    const document = await this.invoiceProcessorService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    return await this.invoiceProcessorService.send(id);
  }

  @ApiOperation({ description: "Send e-invoice note via email" })
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

  @ApiOperation({ description: "Get received e-invoice note by ID" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id/received")
  public async getReceivedEInvoiceById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto & { document_logs: any[] }> {
    const document = await this.invoiceProcessorService.findById(id);

    if (
      !document ||
      (user.endpoint_id !== document.supplier.endpoint_id &&
        user.endpoint_id !== document.customer.endpoint_id)
    ) {
      throw new NotFoundException();
    }

    // Get document logs for this specific document
    const documentLogs = await this.invoiceProcessorService.call(
      "invoice-processor.document-log.findByDocumentId",
      {
        document_id: document.document_id,
        document_type: "received_document",
      }
    );

    return {
      ...document,
      document_logs: documentLogs,
    };
  }

  @ApiOperation({ description: "Get e-invoice note by ID" })
  @ApiGlobalResponse(DocumentResponseDto)
  // @UseGuards(SuperUserGuard)
  // @Permissions("admin.access.customer.create")
  @Get("/e-invoice/:id")
  public async getEinvoiceById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentResponseDto & { document_logs: any[] }> {
    const document = await this.invoiceProcessorService.findById(id);

    if (
      !document ||
      (user.endpoint_id !== document.supplier.endpoint_id &&
        user.endpoint_id !== document.customer.endpoint_id)
    ) {
      throw new NotFoundException();
    }

    // Get document logs for this specific document
    const documentLogs = await this.invoiceProcessorService.call(
      "invoice-processor.document-log.findByDocumentId",
      {
        document_id: document.document_id,
        document_type:
          user.endpoint_id === document.supplier.endpoint_id
            ? "document"
            : "received_document",
      }
    );

    return {
      ...document,
      document_logs: documentLogs,
    };
  }

  @ApiOperation({ description: "Reject e-invoice note" })
  @ApiGlobalResponse(DocumentEntity)
  @Patch("/e-invoice/:id/reject")
  public async reject(
    @Param("id") id: UUID,
    @Body() reject: RejectDocumentRequest,
    @CurrentUser() user: UserResponseDto
  ): Promise<DocumentEntity> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const rejectedDocument = await this.invoiceProcessorService.reject({
      document_id: id,
      reason: reject.reason,
    });

    // Log audit action
    await this.auditLogService.logAction({
      actorId: user.id,
      action: "REJECT",
      resourceId: document.document_id.toString(),
      resourceType: "DOCUMENT",
      fields: ["status", "reject_reason"],
      oldData: document,
      newData: rejectedDocument,
    });

    // Log document action
    await this.documentService.createDocumentLog({
      document_id: document.document_id,
      action: "REJECT",
      user_id: user.id,
      full_name: user.first_name_en + " " + user.last_name_en,
      description: `${document.document_type} ${document.document_number} rejected by customer. Reason: ${reject.reason}`,
      document_type: "document",
    });

    return rejectedDocument;
  }

  @ApiOperation({ description: "Get credit/debit note by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id")
  public async GetById(
    @Param("id") id: UUID,
    @CurrentUser() user: UserResponseDto & { business: BusinessResponseDto }
  ): Promise<DocumentEntity & { supplier: BusinessResponseDto }> {
    const document = await this.documentService.findById(id);

    if (!document || user.endpoint_id !== document.supplier_id) {
      throw new NotFoundException();
    }

    const business = await this.serviceAccountService.getBusinessProfile(user);

    if (document.status === "POSTED") {
      const einvoice = await this.documentService.getEInvoiceDetail(
        document,
        business
      );
      return {
        ...einvoice,
        supplier: business,
        customer: document.customer,
      };
    }

    return {
      ...document,
      supplier: business,
    };
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

  @ApiOperation({ description: "Get credit/debit note by ID" })
  @ApiGlobalResponse(UserResponseDto)
  // @Permissions(
  //   "admin.access.customer.read",
  //   "admin.access.customer.create",
  //   "admin.access.customer.update"
  // )
  @Get("/:id/edit")
  public async editById(
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
      supplier: business,
    };
  }
}
