export function* getCombinations<T>(
  input: T[],
  maxSize: number,
  measure: (item: T) => number
): Generator<T[]> {
  function* getSubsets(
    index: number,
    subset: T[]
  ): Generator<T[]> {
    if (subset.length === maxSize) {
      yield subset;
      return;
    }

    // Optimize by only searching the first third of champions until we have a subset
    // at least size n / 2, at which point we search all champs
    for (let i = index; i < (subset.length < maxSize / 2 ? input.length / 3 : input.length); i++) {
      const current = input[i];
      const weight = measure(current);
      if (weight > 1) {
        return; // Reduce combination space by removing heavier objects
      }
  
      yield* getSubsets(i + weight, subset.slice().concat(current));
    }
  }

  yield* getSubsets(0, []);
}
