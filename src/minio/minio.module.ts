import { Module } from "@nestjs/common";
import { FileController } from "./file/file.controller";
import { MinioProvider } from "./minio.provider";
import { MinioService } from "./minio.service";

@Module({
  imports: [],
  providers: [MinioProvider, MinioService],
  exports: [MinioService],
  controllers: [FileController],
})
export class MinioModule {}
