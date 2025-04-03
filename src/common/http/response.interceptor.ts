import { SKIP_HTTP_RESPONSE } from "@common/decorators/skip-http-response.decorator";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseDto } from "../dtos/response.dto";

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly reflector: Reflector) {}
  /**
   * Intercept the request and add the timestamp
   * @param context {ExecutionContext}
   * @param next {CallHandler}
   * @returns { payload:Response<T>, timestamp: string }
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ResponseDto<T>> {
    const timestamp = new Date().getTime();

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_HTTP_RESPONSE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle(); // Do not transform the response
    }
    return next.handle().pipe(
      map((payload) => {
        return { payload, timestamp };
      })
    );
  }
}
