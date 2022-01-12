import { Character, CharacterParameters } from '../character';

export const CharacterFactoryToken = 'CharacterFactoryToken';

export interface CharacterFactoryInterface {
  createCharacter(characterParameters: CharacterParameters): Character;
}
