import { CharacterParameters } from '../character';
import { Episodes } from '../episodes';
import { CharacterFactory } from './character.factory';

describe('CharacterFactory', () => {
  const factory = new CharacterFactory();

  describe('crateCharacter', () => {
    it('should create a Character with provided parameters', () => {
      const characterParameters: CharacterParameters = {
        name: 'Luke',
        episodes: [Episodes.awakens],
        planet: 'Tatoine',
      };

      const result = factory.createCharacter(characterParameters);

      expect(result.getCharacterParameters()).toEqual(characterParameters);
    });

    it('should use default values if optional parameters are not provided', () => {
      const name = 'Leia';

      const result = factory.createCharacter({ name });

      expect(result).toEqual({ name, episodes: [], planet: null });
    });
  });
});
