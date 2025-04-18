import { ApiProperty } from '@nestjs/swagger';

export class BusinessEndpointResponseDto {
  @ApiProperty({
    description: 'The tax identification number of the business',
    example: '123456789',
  })
  tin: string;

  @ApiProperty({
    description: 'The unique identifier of the business entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entity_id: string;

  @ApiProperty({
    description: 'The English name of the business entity',
    example: 'Acme Corporation',
  })
  entity_name_en: string;

  @ApiProperty({
    description: 'The Khmer name of the business entity',
    example: 'ក្រុមហ៊ុន Acme',
  })
  entity_name_kh: string;
  
  
  @ApiProperty({
    description: 'The endpoint ID of the business',
    example: 'KHUID000001',
  })
  endpoint_id: string;
} 