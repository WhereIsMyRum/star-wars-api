import { Inject } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  CharacterFactoryInterface,
  CharacterFactoryToken,
} from '../domain/factories';
import {
  CharacterRepositoryInterface,
  CharacterRepositoryToken,
} from '../infrastructure/repositories/character.repository.interface';
import { CharacterServiceInterface } from './character.service.interface';
import {
  GetCharacterResponseDto,
  PaginatedGetCharacterResponseDto,
  UpdateCharacterResponseDto,
} from './dtos';
import {
  CharacterAlreadyExistsException,
  CharacterNotFoundException,
} from './exceptions';
import {
  CreateCharacterQueryDto,
  GetCharactersQueryDto,
  UpdateCharacterQueryDto,
} from './queries';

export class CharacterService implements CharacterServiceInterface {
  constructor(
    @Inject(CharacterRepositoryToken)
    private readonly characterRepository: CharacterRepositoryInterface,
    @Inject(CharacterFactoryToken)
    private readonly characterFactory: CharacterFactoryInterface,
  ) {}

  async getAllCharacters(
    query: GetCharactersQueryDto,
  ): Promise<PaginatedGetCharacterResponseDto> {
    const charactersWithMetadata = await this.characterRepository.getAll(
      query.offset,
      query.limit,
    );

    return plainToInstance(PaginatedGetCharacterResponseDto, {
      characters: plainToInstance(
        GetCharacterResponseDto,
        charactersWithMetadata.characters,
        {
          excludeExtraneousValues: true,
        },
      ),
      metadata: charactersWithMetadata.metadata,
    });
  }

  async getCharacterByName(name: string): Promise<GetCharacterResponseDto> {
    const character = await this.characterRepository.getByName(name);

    if (!character) {
      throw new CharacterNotFoundException(name);
    }

    return plainToInstance(GetCharacterResponseDto, character, {
      excludeExtraneousValues: true,
    });
  }

  async createCharacter(query: CreateCharacterQueryDto): Promise<void> {
    if (await this.characterRepository.exists(query.name)) {
      throw new CharacterAlreadyExistsException(query.name);
    }

    const newCharacter = this.characterFactory.createCharacter(query);

    await this.characterRepository.insert(newCharacter);
  }

  async updateCharacter(
    name: string,
    query: UpdateCharacterQueryDto,
  ): Promise<UpdateCharacterResponseDto> {
    if (query.name && (await this.characterRepository.exists(query.name))) {
      throw new CharacterAlreadyExistsException(query.name);
    }

    const character = await this.characterRepository.getByName(name);

    if (!character) {
      throw new CharacterNotFoundException(name);
    }

    character.updateCharacterParameters(query);

    return plainToInstance(
      UpdateCharacterResponseDto,
      this.characterRepository.update(name, character),
      { excludeExtraneousValues: true },
    );
  }

  async deleteCharacterByName(name: string): Promise<void> {
    return this.characterRepository.deleteByName(name);
  }
}
