import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';

import { Character } from '../../domain/character';
import { CharacterModel, CharacterModelsTokens } from '../models';
import { CharacterRepositoryInterface } from './character.repository.interface';

@Injectable()
export class CharacterRepository implements CharacterRepositoryInterface {
  constructor(
    @InjectModel(CharacterModelsTokens.character)
    private readonly characterModel: Model<CharacterModel>,
  ) {}

  async exists(name: string): Promise<boolean> {
    return this.characterModel.exists({ name });
  }

  async insert(character: Character): Promise<void> {
    const newCharacter = await this.characterModel.create(
      character.getCharacterParameters(),
    );

    await newCharacter.save();
  }

  async update(name: string, character: Character): Promise<Character | null> {
    const updatedCharacter: Character = await this.characterModel
      .findOneAndUpdate({ name }, character.getCharacterParameters(), {
        new: true,
        projection: '-_id -__v',
      })
      .lean();

    return plainToInstance(Character, updatedCharacter);
  }

  async getAll(
    offset: number,
    limit: number,
  ): Promise<{
    characters: Character[];
    metadata: { count: number; offset: number; limit: number };
  }> {
    const characters: Character[] = await this.characterModel
      .find({}, '-_id -__v')
      .skip(offset)
      .limit(limit)
      .lean();

    const count = await this.characterModel.estimatedDocumentCount();

    return {
      characters: plainToInstance(Character, characters),
      metadata: { count, offset, limit },
    };
  }

  async getByName(name: string): Promise<Character | null> {
    const character: Character = await this.characterModel
      .findOne({ name }, '-_id -__v')
      .lean();

    return plainToInstance(Character, character);
  }

  async deleteByName(name: string): Promise<void> {
    await this.characterModel.deleteOne({ name }).lean();
  }
}
