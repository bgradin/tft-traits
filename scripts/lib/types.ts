export interface Champion {
  cost: number;
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
