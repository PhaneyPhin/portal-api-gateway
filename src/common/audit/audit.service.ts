import { BaseCrudService } from "@common/services/base-crud.service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLogEntity } from "./audit-log.entity";

export type AuditAction = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "GET"
  | "UPLOAD"
  | "DOWNLOAD"
  | "APPROVE"
  | "REJECT"
  | "SUBMIT"
  | "CANCEL"
  | "REGISTER"
  | "VALIDATE"
  | "CONNECT"
  | "DISCONNECT"
  | 'ACCEPT';

export type AuditResourceType = 
  | "BUSINESS"
  | "USER"
  | "INVOICE"
  | "DOCUMENT"
  | "NOTIFICATION"
  | "REPRESENTATIVE"
  | "SERVICE_PROVIDER"
  | "CONNECTION"
  | "CUSTOMER";

@Injectable()
export class AuditLogService extends BaseCrudService {
  protected FILTER_FIELDS: string[] = ["action", "description", "resource_type"];
  protected SEARCH_FIELDS: string[] = ["action", "description", "resource_type"];

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>
  ) {
    super();
  }

  protected getFilters() {
    return {};
  }

  protected queryName: string = "audit";

  protected getListQuery() {
    return this.auditRepo
      .createQueryBuilder(this.queryName)
      .select([
        `${this.queryName}.action`,
        `${this.queryName}.description`,
        `${this.queryName}.created_at`,
        `${this.queryName}.actor_id`
      ]);
  }

  protected getMapperResponseEntityFields() {
    return (a) => a;
  }

  /**
   * Create an audit log entry
   */
  async logAction({
    actorId,
    action,
    resourceId,
    resourceType,
    fields,
    description,
    oldData = null,
    newData = null,
  }: {
    actorId: string;
    action: AuditAction;
    resourceId: string;
    resourceType: AuditResourceType;
    fields: string[];
    description?: string;
    oldData?: Record<string, any> | null;
    newData?: any | null;
  }): Promise<AuditLogEntity> {
    try {
      const audit = this.auditRepo.create({
        actor_id: actorId,
        action,
        description: description || this.generateDescription(action, resourceType, fields, oldData, newData),
        resource_id: resourceId,
        resource_type: resourceType,
        fields: fields.join(","), // stored as comma-separated string
        old_data: oldData,
        new_data: newData,
      });

      return this.auditRepo.save(audit);
    } catch (e) {
      console.log(e);
    }
  }

  private generateDescription(
    action: AuditAction,
    resourceType: AuditResourceType,
    fields: string[],
    oldData: any,
    newData: any
  ): string {
    switch (action) {
      case 'CREATE':
        switch (resourceType) {
          case 'USER':
            return `Created user with personal code ${newData.personal_code}`;
          case 'CUSTOMER':
            return `Created customer with name ${newData.entity_name_en}`;
          case 'INVOICE':
            return `Created invoice with document number ${newData.document_number}`;
          default:
            return `Created ${resourceType.toLowerCase()}`;
        }
      case 'UPDATE':
        switch (resourceType) {
          case 'USER':
            return `Updated user with personal code ${newData.personal_code}`;
          case 'CUSTOMER':
            return `Updated customer name to ${newData.entity_name_en}`;
          case 'INVOICE':
            return `Updated invoice with document number ${newData.document_number}`;
          default:
            return `Updated ${resourceType.toLowerCase()}`;
        }
      case 'DELETE':
        switch (resourceType) {
          case 'USER':
            return `Deleted user with personal code ${oldData.personal_code}`;
          case 'CUSTOMER':
            return `Deleted customer with name ${oldData.entity_name_en}`;
          case 'INVOICE':
            return `Deleted invoice with document number ${oldData.document_number}`;
          default:
            return `Deleted ${resourceType.toLowerCase()}`;
        }
      case 'GET':
        switch (resourceType) {
          case 'USER':
            return `Retrieved user with personal code ${newData.personal_code}`;
          case 'CUSTOMER':
            return `Retrieved customer with name ${newData.entity_name_en}`;
          case 'INVOICE':
            return `Retrieved invoice with document number ${newData.document_number}`;
          default:
            return `Retrieved ${resourceType.toLowerCase()}`;
        }
      case 'SUBMIT':
        if (resourceType === 'INVOICE' && newData?.document_number) {
          return `Submitted invoice with document number ${newData.document_number}`;
        }
        return `Submitted ${resourceType.toLowerCase()}`;
      case 'UPLOAD':
        return `Uploaded file to ${resourceType.toLowerCase()}`;
      case 'DOWNLOAD':
        return `Downloaded file from ${resourceType.toLowerCase()}`;
      case 'APPROVE':
        return `Approved ${resourceType.toLowerCase()}`;
      case 'REJECT':
        return `Rejected ${resourceType.toLowerCase()}`;
      case 'CANCEL':
        return `Cancelled ${resourceType.toLowerCase()}`;
      case 'REGISTER':
        return `Registered new ${resourceType.toLowerCase()}`;
      case 'VALIDATE':
        return `Validated ${resourceType.toLowerCase()}`;
      case 'CONNECT':
        return `Connected to ${resourceType.toLowerCase()}`;
      case 'DISCONNECT':
        return `Disconnected from ${resourceType.toLowerCase()}`;
      default:
        return `${action} ${resourceType.toLowerCase()}`;
    }
  }

  /**
   * Retrieve audit logs by resource
   */
  async getLogsForResource(
    resourceType: AuditResourceType,
    resourceId: string
  ): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      where: {
        resource_type: resourceType,
        resource_id: resourceId,
      },
      order: { created_at: "DESC" },
    });
  }

  /**
   * Retrieve audit logs for an actor (user)
   */
  async getLogsByActor(actorId: string): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      where: { actor_id: actorId },
      order: { created_at: "DESC" },
    });
  }
}
