import { NotFoundException } from '@nestjs/common';

export class CharacterNotFoundException extends NotFoundException {
  constructor(name: string) {
    super(`Character ${name} was not found.`);
  }
}
