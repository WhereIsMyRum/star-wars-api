import { Character } from '../../domain/character';

export const CharacterRepositoryToken = 'CharacterRepository';

export interface CharacterRepositoryInterface {
  exists(name: string): Promise<boolean>;
  insert(character: Character): Promise<void>;
  update(name: string, character: Character): Promise<Character | null>;
  getAll(
    offset: number,
    limit: number,
  ): Promise<{
    characters: Character[];
    metadata: { count: number; offset: number; limit: number };
  }>;
  getByName(name: string): Promise<Character | null>;
  deleteByName(name: string): Promise<void>;
}
