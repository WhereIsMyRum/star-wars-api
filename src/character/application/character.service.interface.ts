import {
  GetCharacterResponseDto,
  PaginatedGetCharacterResponseDto,
  UpdateCharacterResponseDto,
} from './dtos';
import {
  CreateCharacterQueryDto,
  GetCharactersQueryDto,
  UpdateCharacterQueryDto,
} from './queries';

export const CharacterServiceToken = 'CharacterService';

export interface CharacterServiceInterface {
  createCharacter(query: CreateCharacterQueryDto): Promise<void>;
  updateCharacter(
    name: string,
    query: UpdateCharacterQueryDto,
  ): Promise<UpdateCharacterResponseDto>;
  getAllCharacters(
    query: GetCharactersQueryDto,
  ): Promise<PaginatedGetCharacterResponseDto>;
  getCharacterByName(name: string): Promise<GetCharacterResponseDto>;
  deleteCharacterByName(name: string): Promise<void>;
}
