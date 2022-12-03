import { alphabetically, numericallyDescending } from "./sorting";
import { Champion, TftSet } from "./types";

function measure(champion: Champion): number {
  return ["Dragon", "Colossus"]
    .some(trait => champion.traits.includes(trait)) ? 2 : 1;
}

export class Composition {
  champions: Champion[];
  size: number = 0;
  traits: Record<string, number> = {};
  synergies: Record<string, number> = {};

  constructor(set: TftSet, champions: Champion[]) {
    this.champions = champions;
    this.champions.forEach(champion => {
      this.size += measure(champion);
      champion.traits.forEach(trait => {
        this.traits[trait] = (this.traits[trait] || 0) + 1;
      });
    });
    Object.keys(this.traits).forEach(trait => {
      const synergy = set.traits.find(x => x.name === trait)?.levels.find(x => this.traits[trait] >= x);
      if (synergy && synergy > 0) {
        this.synergies[trait] = synergy;
      }
    });
  }

  hasDuplicates(): boolean {
    return [...new Set(this.champions.map(x => x.name))].length !== this.champions.length;
  }

  hasSynergies(): boolean {
    return Object.keys(this.synergies).length > 0;
  }

  toString(): string {
    return `Champions: ${
      this.champions.sort(alphabetically(x => x.name)).map(x => x.name).join(", ")
    }\nTraits (${Object.keys(this.synergies).length}): ${
      Object.keys(this.synergies)
        .sort(alphabetically(x => x))
        .sort(numericallyDescending(x => this.synergies[x]))
        .map(synergy => `${synergy} ${this.synergies[synergy]}`).join(", ")
    }`;
  }
}
