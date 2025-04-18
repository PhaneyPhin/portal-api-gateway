import { Global, Module } from "@nestjs/common";
import { FileController } from "./file/file.controller";
import { MinioProvider } from "./minio.provider";
import { MinioService } from "./minio.service";

@Module({
  imports: [],
  providers: [MinioProvider, MinioService],
  exports: [MinioService],
  controllers: [FileController],
})
@Global()
export class MinioModule {}
