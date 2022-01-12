export interface CharacterParameters {
  name: string;
  episodes?: string[];
  planet?: string | null;
}

export class Character {
  constructor(
    private name: string,
    private episodes: string[],
    private planet: string | null,
  ) {}

  getName(): string {
    return this.name;
  }

  getCharacterParameters(): Required<CharacterParameters> {
    return {
      name: this.name,
      episodes: this.episodes,
      planet: this.planet,
    };
  }

  updateCharacterParameters(parameters: Partial<CharacterParameters>): void {
    if (parameters.name) {
      this.name = parameters.name;
    }

    if (parameters.episodes) {
      this.episodes = parameters.episodes;
    }

    if (parameters.planet) {
      this.planet = parameters.planet;
    }
  }
}
