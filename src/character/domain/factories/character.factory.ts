import { Injectable } from '@nestjs/common';

import { Character, CharacterParameters } from '../character';
import { CharacterFactoryInterface } from './character.factory.interface';

@Injectable()
export class CharacterFactory implements CharacterFactoryInterface {
  createCharacter(characterParameters: CharacterParameters): Character {
    return new Character(
      characterParameters.name,
      characterParameters.episodes || [],
      characterParameters.planet || null,
    );
  }
}
