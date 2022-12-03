export interface Champion {
  name: string;
  traits: string[];
}

export interface Trait {
  name: string;
  levels: number[];
}

export interface TftSet {
  champions: Champion[];
  traits: Trait[];
}
