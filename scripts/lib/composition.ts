import { Champion, Trait } from "./types";

export type Composition = Champion[];

export function calculateTraits(composition: Composition, traits: Trait[]): Trait[] {
  return traits
    .filter(trait => trait.levels
      .some(level => level <= composition.filter(champion => champion.traits
        .some(x => x === trait.id)).length));
}
