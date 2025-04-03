import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import { ResponseDto } from "../dtos";

export const ApiGlobalResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              payload: {
                $ref: getSchemaPath(model),
              },
              timestamp: {
                type: "number",
              },
            },
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({ description: "Not authenticated" }),
    ApiForbiddenResponse({ description: "Access denied" }),
    ApiNotFoundResponse({ description: "Not found" }),
    ApiInternalServerErrorResponse({ description: "Server error" })
  );
};
