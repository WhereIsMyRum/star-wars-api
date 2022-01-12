import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export const defaultPaginationLimits = {
  limit: 50,
  offset: 0,
};

export class GetCharactersQueryDto {
  @IsEnum([10, 25, 50, 100])
  @ValidateIf((props) => props.offset !== undefined)
  @Transform((limit) => parseInt(limit.value, 10))
  readonly limit: number = defaultPaginationLimits.limit;

  @Max(100)
  @Min(0)
  @IsNumber()
  @ValidateIf((props) => props.limit !== undefined)
  @Transform((offset) => parseInt(offset.value, 10))
  readonly offset: number = defaultPaginationLimits.offset;
}
