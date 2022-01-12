import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateCharacterResponseDto {
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
