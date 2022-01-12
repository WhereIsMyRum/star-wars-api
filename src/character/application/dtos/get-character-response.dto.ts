import { Get } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

class PaginationMetadata {
  @ApiProperty()
  @Expose()
  count!: number;

  @ApiProperty()
  @Expose()
  offset!: number;

  @ApiProperty()
  @Expose()
  limit!: number;
}
export class GetCharacterResponseDto {
  @ApiProperty()
  @Expose()
  readonly name!: string;

  @ApiProperty()
  @Expose()
  readonly episodes!: string[];

  @ApiProperty({ type: String })
  @Expose()
  readonly planet!: string | null;
}

export class PaginatedGetCharacterResponseDto {
  @ApiProperty({ type: GetCharacterResponseDto })
  @Expose()
  readonly characters!: GetCharacterResponseDto[];

  @ApiProperty()
  @Expose()
  readonly metadata!: PaginationMetadata;
}
