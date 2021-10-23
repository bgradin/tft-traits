function* doGetCombinations<T>(
  input: T[],
  index: number,
  current: T[],
  maxSize: number,
  measure: (item: T) => number
): Generator<T[]> {
	if (maxSize < 0) {
  	current.pop();
	}
	if (maxSize <= 0) {
    yield current;
  } else {
    for (let i = index; i < input.length; i++) {
      yield* doGetCombinations(
        input,
        i + 1,
        current.slice().concat([input[i]]),
        maxSize - measure(input[i]),
        measure
      );
    }
  }
}

export function* getCombinations<T>(
  input: T[],
  maxSize: number,
  measure: (item: T) => number
): Generator<T[]> {
  yield* doGetCombinations(input, 0, [], maxSize, measure);
}
