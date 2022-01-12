import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { CharacterRepositoryToken } from '.';
import {
  closeDatasbaseConnection,
  rootMongooseTestModule,
} from '../../../tests';
import { Character } from '../../domain/character';
import { CharacterModel, CharacterModelsTokens } from '../models';
import { CharacterSchema } from '../schemas';
import { CharacterRepository } from './character.repository';
import { CharacterRepositoryInterface } from './character.repository.interface';

describe('CharacterRepository', () => {
  let characterRepository: CharacterRepositoryInterface;
  let characterModel: Model<CharacterModel>;

  const character = new Character(uuid(), [], uuid());

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: CharacterModelsTokens.character, schema: CharacterSchema },
        ]),
      ],
      providers: [
        { provide: CharacterRepositoryToken, useClass: CharacterRepository },
      ],
    }).compile();

    characterRepository = module.get(CharacterRepositoryToken);
    characterModel = module.get(`${CharacterModelsTokens.character}Model`);
  });

  afterAll(async () => {
    await closeDatasbaseConnection();
  });

  beforeEach(async () => {
    await characterModel.create(character);
  });

  afterEach(async () => {
    await characterModel.deleteMany({});
  });

  describe('exists', () => {
    it('should return true if a character exists', async () => {
      const result = await characterRepository.exists(character.getName());

      expect(result).toEqual(true);
    });

    it('should return false if a character does not exist', async () => {
      const result = await characterRepository.exists('random name');

      expect(result).toEqual(false);
    });
  });

  describe('insert', () => {
    it('should create a new character instance in the database', async () => {
      const newCharacter = new Character(uuid(), [], uuid());

      await characterRepository.insert(newCharacter);

      expect(
        await characterModel
          .findOne({ name: newCharacter.getName() }, '-_id -__v')
          .lean(),
      ).toEqual(newCharacter);
    });

    it('should throw an error if the new character breaks schema constraints', async () => {
      await expect(() =>
        characterRepository.insert(character),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing character in the database and return the result', async () => {
      const updateData = new Character(
        character.getName(),
        ['1', '2'],
        'Dunno',
      );

      const result = await characterRepository.update(
        character.getName(),
        updateData,
      );
      const updatedCharacter = await characterModel
        .findOne({ name: character.getName() }, '-_id -__v')
        .lean();

      expect(result).toEqual(updateData);
      expect(updatedCharacter).toEqual(updateData);
    });

    it('should throw an error if the new character data breaks schema constrains', async () => {
      const newCharacter = new Character(uuid(), [], null);

      await characterModel.create(newCharacter);

      await expect(() =>
        characterRepository.update(newCharacter.getName(), character),
      ).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    const count = 20;
    const newCharacters = Array.from(
      { length: count },
      () => new Character(uuid(), [], null),
    );

    it('should return an array with correct entries and with pagination limits', async () => {
      await characterModel.deleteMany({});

      const offset = 2;
      const limit = 8;

      const expectedCharacters = newCharacters.slice(offset, limit + offset);
      await characterModel.insertMany(newCharacters);

      const result = await characterRepository.getAll(offset, limit);

      expect(result.characters).toEqual(expectedCharacters);
      expect(result.metadata).toEqual({ count: count, offset, limit });
    });

    it('should return an empty array if no character exists', async () => {
      await characterModel.deleteMany({});

      const result = await characterRepository.getAll(0, 10);

      expect(result.characters).toEqual([]);
      expect(result.metadata.count).toEqual(0);
    });
  });

  describe('getByName', () => {
    it('should return a character by its name if it exists', async () => {
      const result = await characterRepository.getByName(character.getName());

      expect(result).toEqual(character);
    });

    it('should return null if a character does not exist', async () => {
      const result = await characterRepository.getByName('random-name');

      expect(result).toEqual(null);
    });
  });

  describe('deleteByName', () => {
    const newCharacter = new Character(uuid(), [], null);

    it('should delete a character from the database by its name', async () => {
      await characterModel.create(newCharacter);

      await characterRepository.deleteByName(newCharacter.getName());

      const character = await characterModel
        .findOne({ name: newCharacter.getName() })
        .lean();

      expect(character).toEqual(null);
    });

    it('should not fail if a character with given name does not exist', async () => {
      await expect(() =>
        characterRepository.deleteByName('random name'),
      ).not.toThrow();
    });
  });
});
