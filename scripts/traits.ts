import fs from "fs";
import { BSTree } from "typescript-collections";
import { Validator } from "jsonschema";
import { getCombinations } from "./lib/combinatorics";
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

// Optimize by preferring champs with more traits
set.champions = set.champions.sort(numericallyDescending(x => x.traits.length));

interface CompositionCacheItem {
  champions: Composition;
  traits: Trait[];
}

const compositionCache = new BSTree<CompositionCacheItem>(numericallyDescending(comp => comp.traits.length));

var start = new Date();

for (let composition of getCombinations(
  set.champions,
  TOTAL_SLOTS,
  x => ["Dragon", "Colossus"].some(y => x.traits.includes(y)) ? 2 : 1
)) {
  const compositionWithTraits = {
    champions: composition,
    traits: calculateTraits(composition, set.traits)
  };

  compositionCache.add(compositionWithTraits);

  if (compositionCache.size() >= COMP_LIMIT) {
    const min = compositionCache.minimum();
    if (min) {
      compositionCache.remove(min);
    }
  }
}

console.log(`Top ${COMP_LIMIT} comps by traits:`);

compositionCache.forEach(composition => {
  const alphabeticalChampions = composition.champions
    .sort(alphabetically(champion => champion.name))
    .map(champion => champion.name);
    console.log(`  Champions: ${alphabeticalChampions.join(", ")}`);

  const traitTally = composition.traits
    .map(trait => ({
      name: trait.name,
      maxLevel: trait.levels
        .filter(level => level <= composition.champions
          .filter(champion => champion.traits.some(x => x === trait.name)).length)
        .sort(numericallyDescending(x => x))[0]
    }))
    .sort(numericallyDescending(trait => trait.maxLevel))
    .map(trait => `${trait.name}: ${trait.maxLevel}`)
    .join(", ");
  console.log(`  Traits (${composition.traits.length}): ${traitTally}`);
  console.log("\n");
});

console.log(`Runtime: ${(new Date().getTime() - start.getTime())}ms`);
