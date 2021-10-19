function doExecuteOnCombinations<T>(
  input: T[],
  maxSize: number,
  measure: (item: T) => number,
  execute: (input: T[]) => void,
  prefix: T[]
): boolean {
  const inputCopy = input.slice();
  while (inputCopy.length > 0) {
    const item = inputCopy.shift();
    const itemSize = measure(item);
    if (itemSize <= maxSize) {
      const prefixedItem = prefix.concat(item);

      if (!doExecuteOnCombinations(
        inputCopy,
        maxSize - itemSize,
        measure,
        execute,
        prefixedItem,
      )) {
        execute(prefixedItem);
        return true;
      }
    }
  }

  return false;
}

export function executeOnCombinations<T>(input: T[], maxSize: number, measure: (item: T) => number, execute: (input: T[]) => void) {
  doExecuteOnCombinations(
    input,
    maxSize,
    measure,
    execute,
    []
  );
}
