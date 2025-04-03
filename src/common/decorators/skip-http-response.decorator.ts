import { SetMetadata } from "@nestjs/common";

export const SKIP_HTTP_RESPONSE = "skipHttpResponse";
export const SkipHttpResponse = () => SetMetadata(SKIP_HTTP_RESPONSE, true);
