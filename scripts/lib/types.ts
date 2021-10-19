export interface Champion {
  id: string;
  name: string;
  slots?: number;
  traits: string[];
}

export interface Trait {
  id: string;
  name: string;
  levels: number[];
}

export interface TftSet {
  champions: Champion[];
  traits: Trait[];
}
