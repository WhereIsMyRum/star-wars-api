import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ExceptionsInterceptor } from '../../common';
import {
  CharacterServiceInterface,
  CharacterServiceToken,
  CreateCharacterQueryDto,
  GetCharacterResponseDto,
  GetCharactersQueryDto,
  PaginatedGetCharacterResponseDto,
  UpdateCharacterQueryDto,
  UpdateCharacterResponseDto,
} from '../application';
import { CharacterNotFoundException } from '../application/exceptions';

@ApiTags('Characters')
@UseInterceptors(ExceptionsInterceptor)
@Controller('characters')
export class CharacterController {
  constructor(
    @Inject(CharacterServiceToken)
    private readonly characterService: CharacterServiceInterface,
  ) {}

  @ApiOkResponse({
    description: 'Returns list of characters with pagination metadata.',
    type: PaginatedGetCharacterResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Response when an unexpected exception was thrown.',
  })
  @ApiBadRequestResponse({
    description: 'Response when validation fails.',
  })
  @ApiQuery({
    name: 'limit',
    example: 'limit=10',
    description:
      'Maximal count of items to return in a paginated query. Defaults to 100. Acceptable values are: 10, 25, 50 and 100.',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    example: 'offset=3',
    description: 'Number of items to skip. Defaults to 0.',
    required: false,
  })
  @Get()
  getCharacters(
    @Query(new ValidationPipe({ transform: true }))
    query: GetCharactersQueryDto,
  ): Promise<PaginatedGetCharacterResponseDto> {
    return this.characterService.getAllCharacters(query);
  }

  @ApiOkResponse({
    description: 'Returns a character by specified name.',
    type: GetCharacterResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Response when an unexpected exception was thrown.',
  })
  @ApiNotFoundResponse({
    description: 'Response when character could not be found.',
  })
  @Get(':name')
  getSingleCharacter(
    @Param('name') name: string,
  ): Promise<GetCharacterResponseDto> {
    return this.characterService.getCharacterByName(name);
  }

  @ApiResponse({
    status: 204,
    description: 'Creates a character with specified props.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Response when an unexpected exception was thrown.',
  })
  @ApiBadRequestResponse({
    description: 'Response when validation fails.',
  })
  @ApiConflictResponse({
    description: 'Response when character with specified name already exists.',
  })
  @HttpCode(204)
  @Post()
  async createCharacter(
    @Body(new ValidationPipe()) createCharacterQuery: CreateCharacterQueryDto,
  ): Promise<void> {
    return this.characterService.createCharacter(createCharacterQuery);
  }

  @ApiOkResponse({
    description:
      'Updates the character by name with specified props and returns the updated document.',
    type: UpdateCharacterResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Response when an unexpected exception was thrown.',
  })
  @ApiConflictResponse({
    description: 'Response when character with specified name already exists.',
  })
  @ApiNotFoundResponse({
    description: 'Response when character could not be found.',
  })
  @Put(':name')
  async updateCharacter(
    @Param('name') name: string,
    @Body(new ValidationPipe()) updateCharacterQuery: UpdateCharacterQueryDto,
  ): Promise<UpdateCharacterResponseDto> {
    return this.characterService.updateCharacter(name, updateCharacterQuery);
  }

  @ApiOkResponse({
    description: 'Delete request was processed correctly.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Response when an unexpected exception was thrown.',
  })
  @HttpCode(204)
  @Delete(':name')
  async deleteCharacter(@Param('name') name: string): Promise<void> {
    return this.characterService.deleteCharacterByName(name);
  }
}
