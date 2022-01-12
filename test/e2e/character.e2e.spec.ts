import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';

import { CharacterModule } from '../../src/character';
import {
  CreateCharacterQueryDto,
  defaultPaginationLimits,
} from '../../src/character/application';
import { Character } from '../../src/character/domain';
import {
  CharacterModel,
  CharacterModelsTokens,
  CharacterSchema,
} from '../../src/character/infrastructure';
import {
  closeDatasbaseConnection,
  rootMongooseTestModule,
} from '../../src/tests/utils';

describe('CharacterModule', () => {
  let app: INestApplication;
  let api: request.SuperTest<request.Test>;
  let characterModel: Model<CharacterModel>;

  const characters = Array.from(
    { length: 100 },
    () => new Character(uuid(), [], null),
  );

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CharacterModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: CharacterModelsTokens.character, schema: CharacterSchema },
        ]),
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();

    api = request(app.getHttpServer());
    characterModel = module.get(`${CharacterModelsTokens.character}Model`);
  });

  afterAll(async () => {
    await closeDatasbaseConnection();
    await app.close();
  });

  beforeEach(async () => {
    await characterModel.insertMany(characters);
  });

  afterEach(async () => {
    await characterModel.deleteMany({});
  });

  describe('Get characters', () => {
    it('should return a 200 and characters with default pagination limits', async () => {
      const response = await api.get('/characters').expect(200);

      expect(response.body.characters).toEqual(characters.slice(0, 50));
      expect(response.body.metadata).toEqual({
        count: characters.length,
        ...defaultPaginationLimits,
      });
    });

    it('should return a 200 and data according to the pagination query params', async () => {
      const offset = 10;
      const limit = 25;

      const response = await api
        .get(`/characters?offset=${offset}&limit=${limit}`)
        .expect(200);

      expect(response.body.characters).toEqual(
        characters.slice(offset, offset + limit),
      );
      expect(response.body.metadata).toEqual({
        count: characters.length,
        offset,
        limit,
      });
    });

    it('should return a 400 if offset is less than 0', async () => {
      const offset = -1;
      const limit = 25;

      await api.get(`/characters?offset=${offset}&limit=${limit}`).expect(400);
    });

    it('should return a 400 if offset is greater than 100', async () => {
      const offset = 101;
      const limit = 25;

      await api.get(`/characters?offset=${offset}&limit=${limit}`).expect(400);
    });

    it('should return a 400 if offset is not a number', async () => {
      const offset = 'not-a-number';
      const limit = 25;

      await api.get(`/characters?offset=${offset}&limit=${limit}`).expect(400);
    });

    it('should return a 400 if limit is not 10, 25 or 50, 100', async () => {
      const offset = 5;
      const limit = 37;

      await api.get(`/characters?offset=${offset}&limit=${limit}`).expect(400);
    });

    it('should return a 400 if limit is not a number', async () => {
      const offset = 5;
      const limit = 'not-a-number';

      await api.get(`/characters?offset=${offset}&limit=${limit}`).expect(400);
    });

    it('should return an empty array and a 200 if no characters exist', async () => {
      await characterModel.deleteMany({});

      const response = await api.get(`/characters`).expect(200);

      expect(response.body.characters).toEqual([]);
      expect(response.body.metadata).toEqual({
        count: 0,
        ...defaultPaginationLimits,
      });
    });
  });

  describe('Get single character', () => {
    it('should return a 200 and the character by its name', async () => {
      const response = await api
        .get(`/characters/${characters[0].getName()}`)
        .expect(200);

      expect(response.body).toEqual(characters[0]);
    });

    it('should return a 404 if a character with the given name does not exist', async () => {
      await api.get('/characters/IDoNotExist').expect(404);
    });
  });

  describe('Create character', () => {
    const newCharacter: CreateCharacterQueryDto = {
      name: uuid(),
      episodes: [],
      planet: null,
    };

    it('should create a new character and return 204', async () => {
      await api.post('/characters').type('json').send(newCharacter).expect(204);

      const character = await characterModel
        .findOne({ name: newCharacter.name }, '-_id -__v')
        .lean();

      expect(character).toEqual(newCharacter);
    });

    it('should return a 409 if a character with given name already exists', async () => {
      await api
        .post('/characters')
        .type('json')
        .send({ ...newCharacter, name: characters[0].getName() })
        .expect(409);
    });

    it('should return a 400 if name is not passed', async () => {
      await api
        .post('/characters')
        .type('json')
        .send({ random: 'random-data' })
        .expect(400);
    });

    it('should return a 400 if name is not a string', async () => {
      await api.post('/characters').type('json').send({ name: 10 }).expect(400);
    });

    it('should return a 400 if episodes contain an invalid episode', async () => {
      await api
        .post('/characters')
        .type('json')
        .send({ name: 'name', episodes: ['no such star wars movie'] })
        .expect(400);
    });

    it('should return a 400 if planet is not a string', async () => {
      await api
        .post('/characters')
        .type('json')
        .send({ name: 'name', planet: 10 })
        .expect(400);
    });
  });

  describe('Update character', () => {
    it('should return a 200, update the character and return it ', async () => {
      const updateData = {
        name: 'Luke',
        episodes: ['The Empire Strikes Back'],
        planet: 'Naboo',
      };

      const response = await api
        .put(`/characters/${characters[0].getName()}`)
        .type('json')
        .send(updateData)
        .expect(200);

      const character = await characterModel
        .findOne({ name: updateData.name }, '-_id -__v')
        .lean();

      expect(response.body).toEqual(updateData);
      expect(character).toEqual(updateData);
    });

    it('should return a 409 if a character with given name already exists', async () => {
      await api
        .put(`/characters/${characters[0].getName()}`)
        .type('json')
        .send({ name: characters[1].getName() })
        .expect(409);
    });

    it('should return a 400 if name is not a string', async () => {
      await api.post('/characters').type('json').send({ name: 10 }).expect(400);
    });

    it('should return a 400 if episodes contain an invalid episode', async () => {
      await api
        .put(`/characters/${characters[0].getName()}`)
        .type('json')
        .send({ name: 'name', episodes: ['no such star wars movie'] })
        .expect(400);
    });

    it('should return a 400 if planet is not a string', async () => {
      await api
        .put(`/characters/${characters[0].getName()}`)
        .type('json')
        .send({ name: 'name', planet: 10 })
        .expect(400);
    });
  });

  describe('Delete character', () => {
    it('should return a 204 and delete the character by name', async () => {
      const existingCharacter = await characterModel
        .findOne({ name: characters[0].getName() }, '-_id -__v')
        .lean();

      await api.delete(`/characters/${characters[0].getName()}`).expect(204);

      const deletedCharacter = await characterModel
        .findOne({ name: characters[0].getName() })
        .lean();

      expect(existingCharacter).toEqual(characters[0]);
      expect(deletedCharacter).toEqual(null);
    });
  });
});
