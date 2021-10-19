import fs from "fs";
import { Validator } from "jsonschema";
import { executeOnCombinations } from "./lib/combinatorics";
import { alphabetically, numericallyDescending } from "./lib/sorting";
import { calculateTraits, Composition } from "./lib/composition";
import { TftSet, Trait } from "./lib/types";

const USAGE = "Usage: yarn traits <JSON set file> <slots (optional)> <limit (optional)>";

const DEFAULT_SLOTS = 8;
const DEFAULT_COMP_LIMIT = 10;

const SET_FILENAME = process.argv[2];
const TOTAL_SLOTS = parseInt(process.argv[3] || DEFAULT_SLOTS.toString(), 10);
const COMP_LIMIT = parseInt(process.argv[4] || DEFAULT_COMP_LIMIT.toString(), 10);

function printAndExitWithFailure(message: string) {
  console.error(message);
  process.exit(1);
}

if (isNaN(TOTAL_SLOTS) || TOTAL_SLOTS < 1) {
  printAndExitWithFailure(USAGE);
}
if (isNaN(COMP_LIMIT) || COMP_LIMIT < 1) {
  printAndExitWithFailure(USAGE);
}

const schema = JSON.parse(fs.readFileSync("schema/set.json", "utf8"));
const validator = new Validator();
validator.addSchema(schema);

const set = JSON.parse(fs.readFileSync(SET_FILENAME, "utf8")) as TftSet;
const validatorResult = validator.validate(set, schema);
if (!validatorResult.valid) {
  printAndExitWithFailure("Invalid JSON set file specified.");
}

interface CompositionCacheItem {
  champions: Composition;
  traits: Trait[];
}

let compositionCache: CompositionCacheItem[] = [];
executeOnCombinations(set.champions, TOTAL_SLOTS, x => x.slots || 1, (composition: Composition) => {
  const compositionWithTraits = {
    champions: composition,
    traits: calculateTraits(composition, set.traits)
  };

  if (compositionCache.length < COMP_LIMIT) {
    compositionCache.push(compositionWithTraits);
  } else {
    const inferiorCompIndex = compositionCache.findIndex(comp => comp.traits.length < compositionWithTraits.traits.length);
    if (inferiorCompIndex !== -1) {
      compositionCache[inferiorCompIndex] = compositionWithTraits;
    }
  }
});

console.log(`Top ${COMP_LIMIT} comps by traits:`);
for (let i = 0; i < COMP_LIMIT; i++) {
  const composition = compositionCache[i];

  console.log(`${i + 1}.`)

  const alphabeticalChampions = composition.champions
    .sort(alphabetically(champion => champion.name))
    .map(champion => champion.name);
  console.log(`  Champions: ${alphabeticalChampions.join(", ")}`);

  const traitTally = composition.traits
    .map(trait => ({
      name: trait.name,
      maxLevel: trait.levels
        .filter(level => level <= composition.champions
          .filter(champion => champion.traits.some(x => x === trait.id)).length)
        .sort(numericallyDescending(x => x))[0]
    }))
    .sort(numericallyDescending(trait => trait.maxLevel))
    .map(trait => `${trait.name}: ${trait.maxLevel}`)
    .join(", ");
  console.log(`  Traits: ${traitTally}`);
}
