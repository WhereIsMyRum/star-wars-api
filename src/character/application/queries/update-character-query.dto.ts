import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Episodes } from '../../domain/episodes';

export class UpdateCharacterQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Episodes, { each: true })
  readonly episodes!: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  readonly planet!: string | null;
}
