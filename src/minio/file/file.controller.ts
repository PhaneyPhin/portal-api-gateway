import { getPresignUrl } from "@libs/pagination/minio";
import { TOKEN_NAME } from "@modules/auth";
import { SkipApprove } from "@modules/auth/decorators/skip-approve";
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { Multer } from "multer";
import { MinioService } from "../minio.service";

@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: "upload",
  version: "1",
})
export class FileController {
  constructor(private minioService: MinioService) {}

  @Get("/:path")
  async viewFile(@Param("path") path: string) {
    console.log(path);
    return await this.minioService.getPreviewUrl(path);
  }

  @SkipApprove()
  @Post("image")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "image file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Multer.File) {
    const path = await this.minioService.uploadImage(
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );

    const url = await getPresignUrl("images", path);

    return {
      path,
      url,
    };
  }

  @SkipApprove()
  @Post("document")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "document file",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(@UploadedFile() file: Multer.File) {
    const path = await this.minioService.uploadFile(
      "documents",
      new Date().getTime() + "-" + file.originalname,
      file.buffer
    );

    const url = await getPresignUrl("documents", path);

    return {
      path,
      url,
    };
  }
}
