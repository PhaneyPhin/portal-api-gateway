import { CommonModule } from "@common/common.module";
import { Global, Module } from "@nestjs/common";
import { MinioModule } from "src/minio/minio.module";
import { AttestationService } from "./attestation/attestation.service";
import { BusinessController } from "./business/business.controller";
import { ServiceAccountService } from "./business/service-account.service";
import { EKYBService } from "./ekyb/ekyb.service";
import { ConverterService } from "./format-converter/converter.service";
import { InvoiceProcessorService } from "./invoiceprocessor/invoiceprocessor.service";
import { NotificationService } from "./notification/notificaiton.service";
import { ServiceProviderController } from "./service-provider/service-provider.controller";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";

@Module({
  imports: [MinioModule, CommonModule],
  controllers: [UserController, BusinessController, ServiceProviderController],
  providers: [
    UserService,
    ServiceAccountService,
    NotificationService,
    InvoiceProcessorService,
    AttestationService,
    EKYBService,
    ConverterService,
  ],
  exports: [
    UserService,
    ServiceAccountService,
    NotificationService,
    InvoiceProcessorService,
    AttestationService,
    ConverterService,
    EKYBService,
  ], // export so other modules can use it
})
@Global()
export class EInvoiceModule {}
