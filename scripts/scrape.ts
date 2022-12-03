import { get } from "./lib/utils";
import { Validator } from "jsonschema";
import fs from "fs";
import { promisify } from "util";
import { Champion, Trait, TftSet } from "./lib/types";

const writeFile = promisify(fs.writeFile);

const SET = 8;

interface InputChampion {
  name: string;
  origin: string[];
  set: number[];
  type: string[];
}

interface TraitBonus {
  count: number;
}

interface InputTrait {
  bonus: TraitBonus[];
  name: string;
  set: number[];
}

const CHAMPION_SCHEMA = {
  id: "/Champion",
  type: "object",
  properties: {
    cost: { type: "number" },
    name: { type: "string" },
    origin: {
      type: "array",
      items: { type: "string" }
    },
    set: {
      type: "array",
      items: { type: "number" }
    },
    type: {
      type: "array",
      items: { type: "string" }
    },
  },
  required: [
    "cost",
    "name",
    "origin",
    "set",
    "type"
  ]
}

const TRAIT_BONUS_SCHEMA = {
  id: "/TraitBonus",
  type: "object",
  properties: {
    count: { type: "number" }
  },
}

const TRAIT_SCHEMA = {
  id: "/Trait",
  type: "object",
  properties: {
    bonus: {
      type: "array",
      items: { "$ref": "/TraitBonus" }
    },
    name: { type: "string" },
    set: {
      type: "array",
      items: { type: "number" }
    },
  },
  required: [
    "bonus",
    "name",
    "set"
  ]
}

async function run() {
  const html = await get("https://tftactics.gg/db/champions");
  const jsMatch = html.match(/src="([^"]*main[^"]*\.chunk\.js)"/);
  if (jsMatch === null) {
    process.exit(1);
  }

  const js = await get("https://tftactics.gg" + jsMatch[1]);
  const rawJsonBlobs = [...js.matchAll(/JSON\.parse\(\'((\\\'|[^\'])*)\'\)/g)]
    .map(
      x => x[1]
        .replace(/\\\'/g, "'")

        // Remove escape sequences
        .replace(/\\x../g, "")
        .replace(/\\u..../g, "")
    );

  const set: TftSet = {
    champions: [],
    traits: [],
  };
  for (let i = 0; i < rawJsonBlobs.length; i++) {
    const raw = rawJsonBlobs[i];

    var json = {};
    try {
      json = JSON.parse(raw);
    } catch (e) {
      continue;
    }

    const championValidator = new Validator();
    championValidator.addSchema(CHAMPION_SCHEMA);
    const championValidationResult = championValidator.validate(json, {
      id: "/ChampionArray",
      type: "array",
      items: { "$ref": "/Champion" }
    });
    if (championValidationResult.errors.length === 0) {
      set.champions.push(...(json as InputChampion[])
      .filter(champion => champion.set.includes(SET))
      .map(champion => ({
        name: champion.name,
        traits: champion.origin.concat(champion.type),
      })));
    }

    const traitValidator = new Validator();
    traitValidator.addSchema(TRAIT_BONUS_SCHEMA);
    traitValidator.addSchema(TRAIT_SCHEMA);
    const traitValidationResult = traitValidator.validate(json, {
      id: "/TraitArray",
      type: "array",
      items: { "$ref": "/Trait" }
    });
    if (traitValidationResult.errors.length === 0) {
      set.traits.push(...(json as InputTrait[])
      .filter(trait => trait.set.includes(SET))
      .map(trait => ({
        name: trait.name,
        levels: trait.bonus.filter(x => typeof x.count === "number").map(x => x.count),
      })))
    }
  }

  await writeFile(`data/set-${SET}.json`, JSON.stringify(set, null, 2));
}

run();
