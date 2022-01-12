import { Character, CharacterParameters } from './character';
import { Episodes } from './episodes';

describe('Character', () => {
  const parameters: CharacterParameters = {
    name: 'Luke',
    episodes: [Episodes.jedi_return, Episodes.empire],
    planet: 'Naboo',
  };

  const character = new Character(
    parameters.name,
    parameters.episodes!,
    parameters.planet!,
  );

  describe('getName', () => {
    it("should return character's name", () => {
      expect(character.getName()).toEqual(parameters.name);
    });
  });

  describe('getCharacterParameters', () => {
    it("should return all character's parameters", () => {
      expect(character.getCharacterParameters()).toEqual(parameters);
    });
  });

  describe('updateCharacterParameters', () => {
    it('should update all properties', () => {
      const newParams: CharacterParameters = {
        name: 'Old Luke',
        episodes: [Episodes.last_jedi],
        planet: 'Anch-to',
      };

      character.updateCharacterParameters(newParams);

      expect(character.getCharacterParameters()).toEqual(newParams);
    });

    it('should allow partial props updates', () => {
      const newPartialProps: CharacterParameters = {
        name: 'Luke Is Gone',
        episodes: [Episodes.rise],
      };

      character.updateCharacterParameters(newPartialProps);

      expect(character.getCharacterParameters()).toEqual({
        ...newPartialProps,
        planet: character.getCharacterParameters().planet,
      });
    });
  });
});
