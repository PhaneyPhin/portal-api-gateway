import { PaginationRequest } from "./interfaces";
import { PaginationResponseDto } from "./pagination-response.dto";

export class Pagination {
  /**
   * Return pagination response
   * @param PaginationRequest {PaginationRequest}
   * @param totalRecords {number}
   * @param dtos {t[]}
   * @returns {PaginationResponseDto}
   */
  static of<T>(
    { limit, page, skip }: PaginationRequest,
    totalRecords: number,
    dtos: T[]
  ): PaginationResponseDto<T> {
    const totalPages =
      Math.floor(totalRecords / limit) + (totalRecords % limit > 0 ? 1 : 0);
    const currentPage = +page > 0 ? +page : 1;
    const hasNext = currentPage <= totalPages - 1;

    return {
      data: dtos,
      pagination: {
        page: page,
        size: limit,
        total_counts: totalRecords,
        has_next: hasNext,
        total_pages: totalPages,
      },
    };
  }
}
