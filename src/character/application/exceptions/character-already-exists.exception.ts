import { ConflictException } from '@nestjs/common';

export class CharacterAlreadyExistsException extends ConflictException {
  constructor(name: string) {
    super(`Character with name ${name} already exists.`);
  }
}
