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

export const ApiGlobalResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        $ref: getSchemaPath(model), // only model in swagger
      },
    }),
    ApiUnauthorizedResponse({ description: "Not authenticated" }),
    ApiForbiddenResponse({ description: "Access denied" }),
    ApiNotFoundResponse({ description: "Not found" }),
    ApiInternalServerErrorResponse({ description: "Server error" })
  );
};
