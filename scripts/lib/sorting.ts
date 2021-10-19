type Comparator<T> = (a: T, b: T) => number;

function createComparator<TInput, TKey>(getKey: (input: TInput) => TKey): Comparator<TInput> {
  return (a, b) => {
    const aKey = getKey(a);
    const bKey = getKey(b);

    if (aKey < bKey) {
      return -1;
    }

    return aKey > bKey ? 1 : 0;
  }
}

function createDescendingComparator<TInput, TKey>(getKey: (input: TInput) => TKey): Comparator<TInput> {
  const ascendingComparator = createComparator(getKey);
  return (a, b) => ascendingComparator(a, b) * -1;
}

export function alphabetically<T>(getKey: (input: T) => string): Comparator<T> {
  return createComparator(getKey);
}

export function numerically<T>(getKey: (input: T) => number): Comparator<T> {
  return createComparator(getKey);
}

export function alphabeticallyDescending<T>(getKey: (input: T) => string): Comparator<T> {
  return createDescendingComparator(getKey);
}

export function numericallyDescending<T>(getKey: (input: T) => number): Comparator<T> {
  return createDescendingComparator(getKey);
}
