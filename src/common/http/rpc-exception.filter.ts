import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log(exception);
    const error = exception;

    const status = error?.status || error?.statusCode || error?.code || 500;
    const message = error?.message || "Internal server error";

    console.error("🧨 AllExceptionsFilter:", error);

    return response
      .status([200, 201, 400, 422, 403, 500].includes(status) ? status : 500)
      .json({
        success: false,
        message,
        code: status,
        data: error?.data || null,
      });
  }
}
