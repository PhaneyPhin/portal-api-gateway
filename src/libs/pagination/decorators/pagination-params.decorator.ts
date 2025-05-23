import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DefaultPagination } from '../interfaces';

/**
 * Decorator intended for building a PaginationRequest object based on the query string parameters
 */
export const PaginationParams = createParamDecorator(
  (
    data: DefaultPagination = {
      defaultSkip: 0,
      defaultPage: 0,
      defaultLimit: 10,
      defaultOrder: {},
      defaultOrderDirection: 'ASC',
      maxAllowedSize: 20,
    },
    ctx: ExecutionContext,
  ) => {
    let {
      query: { skip, page, limit, orderBy, orderDirection, keyword, search, ...params },
    } = ctx.switchToHttp().getRequest();

    const { defaultSkip, defaultPage, defaultLimit, defaultOrder, defaultOrderDirection, maxAllowedSize } = data;

    const order = orderBy ? { [orderBy]: orderDirection ? orderDirection : defaultOrderDirection } : defaultOrder;

    limit = limit && limit > 0 ? +limit : defaultLimit;
    params.search = search || keyword;
    
    if (!skip) {
      if (page) {
        skip = (+page - 1) * +limit;
        skip = skip >= 0 ? skip : 0;
      } else {
        page = defaultPage;
        skip = defaultSkip;
      }
    } else {
      page = Math.floor(+skip / limit);
    }

    return Object.assign(data ? data : {}, {
      skip,
      page,
      limit,
      order,
      params,
    });
  },
);
