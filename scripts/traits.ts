import fs from "fs";
import { BSTree } from "typescript-collections";
import { Validator } from "jsonschema";
import { Composition } from "./lib/composition";
import { TftSet } from "./lib/types";
import { numericallyDescending } from "./lib/sorting";

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

set.traits.forEach(trait => trait.levels = trait.levels.sort(numericallyDescending(x => x)))

function* findComps(
  size: number,
  comp = new Composition(set, []),
  index = 0
): Generator<Composition> {
  if (comp.size > size || comp.hasDuplicates() || (comp.size > 2 && !comp.hasSynergies())) {
    return;
  }

  if (comp.size === size) {
    yield comp;
    return;
  }

  for (let i = index; i < set.champions.length; i++) {
    yield* findComps(size, new Composition(set, [...comp.champions, set.champions[i]]), i + 1);
  }
}

const compositionCache = new BSTree<Composition>(numericallyDescending(comp => Object.keys(comp.synergies).length));

var start = new Date();

for (let composition of findComps(TOTAL_SLOTS)) {
  compositionCache.add(composition);

  if (compositionCache.size() >= COMP_LIMIT) {
    const min = compositionCache.minimum();
    if (min) {
      compositionCache.remove(min);
    }
  }
}

console.log(`Top ${COMP_LIMIT} comps by traits:`);

compositionCache.forEach(composition => {
  console.log(composition.toString());
  console.log("\n");
});

console.log(`Runtime: ${(new Date().getTime() - start.getTime())}ms`);
