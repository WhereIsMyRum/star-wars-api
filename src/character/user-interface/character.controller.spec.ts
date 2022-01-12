import { Test } from '@nestjs/testing';

import {
  CreateCharacterQueryDto,
  GetCharacterResponseDto,
  UpdateCharacterQueryDto,
  UpdateCharacterResponseDto,
} from '../application';
import {
  CharacterServiceInterface,
  CharacterServiceToken,
  PaginatedGetCharacterResponseDto,
} from '../application';
import { CharacterController } from './character.controller';

describe('CharacterController', () => {
  let controller: CharacterController;
  let characterService: CharacterServiceInterface;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CharacterController,
        {
          provide: CharacterServiceToken,
          useValue: {
            createCharacter: jest.fn(),
            updateCharacter: jest.fn(),
            getAllCharacters: jest.fn(),
            getCharacterByName: jest.fn(),
            deleteCharacterByName: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CharacterController);
    characterService = module.get(CharacterServiceToken);
  });

  describe('getCharacters', () => {
    const expectedResult: PaginatedGetCharacterResponseDto = {
      metadata: { count: 10, offset: 0, limit: 0 },
      characters: [],
    };
    const paginationData = { offset: 10, limit: 25 };

    it('should pass the pagination query to getAllCharacters service method and return the result', async () => {
      jest
        .spyOn(characterService, 'getAllCharacters')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.getCharacters(paginationData);

      expect(characterService.getAllCharacters).toHaveBeenCalledWith(
        paginationData,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSingleCharacter', () => {
    const name = 'Luke';
    const expectedResult: GetCharacterResponseDto = {
      name,
      episodes: [],
      planet: null,
    };

    it('should call the getCharacterByName service method with parameter name and return the result', async () => {
      jest
        .spyOn(characterService, 'getCharacterByName')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.getSingleCharacter(name);

      expect(characterService.getCharacterByName).toHaveBeenCalledWith(name);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createCharacter', () => {
    const query: CreateCharacterQueryDto = {
      name: 'Luke',
      planet: 'Alderaan',
      episodes: [],
    };

    it('should call createCharacter service method and return the result', async () => {
      await controller.createCharacter(query);

      expect(characterService.createCharacter).toHaveBeenCalledWith(query);
    });
  });

  describe('updateCharacter', () => {
    const newName = 'Luke 2.0';
    const query: UpdateCharacterQueryDto = {
      name: newName,
      planet: 'Alderaan',
      episodes: [],
    };
    const expectedResult: UpdateCharacterResponseDto = query;

    it('should call updateCharacter service method and return the result', async () => {
      jest
        .spyOn(characterService, 'updateCharacter')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.updateCharacter(newName, query);

      expect(characterService.updateCharacter).toHaveBeenCalledWith(
        newName,
        query,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteCharacter', () => {
    const name = 'Darth Vader';

    it('should call deleteCharacterByName service method', async () => {
      await controller.deleteCharacter(name);

      expect(characterService.deleteCharacterByName).toHaveBeenCalledWith(name);
      ('');
    });
  });
});
