import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';

import { PaginatedGetCharacterResponseDto } from '.';
import { Character } from '../domain/character';
import {
  CharacterFactoryInterface,
  CharacterFactoryToken,
} from '../domain/factories';
import {
  CharacterRepositoryInterface,
  CharacterRepositoryToken,
} from '../infrastructure/repositories';
import { CharacterService } from './character.service';
import {
  CharacterServiceInterface,
  CharacterServiceToken,
} from './character.service.interface';
import {
  CharacterAlreadyExistsException,
  CharacterNotFoundException,
} from './exceptions';

describe('CharacterService', () => {
  let characterService: CharacterServiceInterface;
  let characterRepository: CharacterRepositoryInterface;
  let characterFactory: CharacterFactoryInterface;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: CharacterServiceToken,
          useClass: CharacterService,
        },
        {
          provide: CharacterRepositoryToken,
          useValue: {
            exists: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            getAll: jest.fn(),
            getByName: jest.fn(),
            deleteByName: jest.fn(),
          },
        },
        {
          provide: CharacterFactoryToken,
          useValue: {
            createCharacter: jest.fn(),
          },
        },
      ],
    }).compile();

    characterService = module.get(CharacterServiceToken);
    characterRepository = module.get(CharacterRepositoryToken);
    characterFactory = module.get(CharacterFactoryToken);
  });

  afterEach(() => jest.clearAllMocks());

  const charactersData = Array.from({ length: 3 }, () => ({
    name: uuid(),
    episodes: [],
    planet: null,
  }));
  const characters = charactersData.map(
    (characterData) =>
      new Character(
        characterData.name,
        characterData.episodes,
        characterData.planet,
      ),
  );

  describe('getAllCharacters', () => {
    const offset = 0;
    const limit = 10;
    const count = characters.length;

    it('should retrieve all characters from the repository and return them', async () => {
      const expectedResult: PaginatedGetCharacterResponseDto = {
        characters: charactersData,
        metadata: {
          count,
          offset,
          limit,
        },
      };

      jest.spyOn(characterRepository, 'getAll').mockResolvedValueOnce({
        characters,
        metadata: { count, offset, limit },
      });

      const result = await characterService.getAllCharacters({ offset, limit });

      expect(characterRepository.getAll).toHaveBeenCalledWith(offset, limit);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty characters array if no characters exist', async () => {
      const expectedResult: PaginatedGetCharacterResponseDto = {
        characters: [],
        metadata: {
          count,
          offset,
          limit,
        },
      };

      jest.spyOn(characterRepository, 'getAll').mockResolvedValueOnce({
        characters: [],
        metadata: { count, offset, limit },
      });

      const result = await characterService.getAllCharacters({ offset, limit });

      expect(characterRepository.getAll).toHaveBeenCalledWith(offset, limit);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCharacterByName', () => {
    const name = 'some-name';

    it('should return characters data if it is found', async () => {
      jest
        .spyOn(characterRepository, 'getByName')
        .mockResolvedValueOnce(characters[0]);

      const result = await characterService.getCharacterByName(name);

      expect(characterRepository.getByName).toHaveBeenCalledWith(name);
      expect(result).toEqual(characters[0].getCharacterParameters());
    });

    it('should throw CharacterNotFoundException if no character with this name is found', async () => {
      jest.spyOn(characterRepository, 'getByName').mockResolvedValueOnce(null);

      await expect(() =>
        characterService.getCharacterByName(name),
      ).rejects.toThrow(CharacterNotFoundException);
    });
  });

  describe('createCharacter', () => {
    it('should create a new character via factory and save it in the repository', async () => {
      jest.spyOn(characterRepository, 'exists').mockResolvedValueOnce(false);
      jest
        .spyOn(characterFactory, 'createCharacter')
        .mockReturnValueOnce(characters[0]);

      await characterService.createCharacter(charactersData[0]);

      expect(characterRepository.exists).toHaveBeenCalledWith(
        charactersData[0].name,
      );
      expect(characterFactory.createCharacter).toHaveBeenCalledWith(
        charactersData[0],
      );
      expect(characterRepository.insert).toHaveBeenCalledWith(characters[0]);
    });

    it('should throw CharacterAlreadyExistsException if character with a given name already exists', async () => {
      jest.spyOn(characterRepository, 'exists').mockResolvedValueOnce(true);

      await expect(() =>
        characterService.createCharacter(charactersData[0]),
      ).rejects.toThrow(CharacterAlreadyExistsException);
    });
  });

  describe('updateCharacter', () => {
    const characterMock = {
      updateCharacterParameters: jest.fn(),
    } as unknown as Character;

    const characterToUpdateName = 'character-to-update';

    const updateQuery = {
      name: 'new-name',
      episodes: [],
      planet: null,
    };

    it("should call character's update method, save it and return it", async () => {
      jest
        .spyOn(characterRepository, 'getByName')
        .mockResolvedValueOnce(characterMock);
      jest.spyOn(characterRepository, 'exists').mockResolvedValueOnce(false);
      jest
        .spyOn(characterRepository, 'update')
        .mockResolvedValueOnce(characters[0]);

      const result = await characterService.updateCharacter(
        characterToUpdateName,
        updateQuery,
      );

      expect(characterRepository.getByName).toHaveBeenCalledWith(
        characterToUpdateName,
      );
      expect(characterMock.updateCharacterParameters).toHaveBeenCalledWith(
        updateQuery,
      );
      expect(characterRepository.update).toHaveBeenCalledWith(
        characterToUpdateName,
        characterMock,
      );
      expect(result).toEqual(characters[0].getCharacterParameters());
    });

    it('should throw CharacterNotFoundException if a character with given name does not exist', async () => {
      jest.spyOn(characterRepository, 'getByName').mockResolvedValueOnce(null);

      await expect(() =>
        characterService.updateCharacter(updateQuery.name, updateQuery),
      ).rejects.toThrow(CharacterNotFoundException);
    });

    it('should throw CharacterAlreadyExists if a character with the name given in update params already exists', async () => {
      jest
        .spyOn(characterRepository, 'getByName')
        .mockResolvedValueOnce(characterMock);
      jest.spyOn(characterRepository, 'exists').mockResolvedValueOnce(true);

      await expect(() =>
        characterService.updateCharacter(updateQuery.name, updateQuery),
      ).rejects.toThrow(CharacterAlreadyExistsException);
    });
  });

  describe('deleteCharacterByName', () => {
    const name = 'delete-me';

    it("should call deleteByName repository method with the character's name", async () => {
      await characterService.deleteCharacterByName(name);

      expect(characterRepository.deleteByName).toHaveBeenCalledWith(name);
    });
  });
});
