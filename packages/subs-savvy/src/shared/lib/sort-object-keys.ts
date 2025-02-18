export function sortObjectKeys<T extends Record<string, unknown>>(
  translation: T,
): T {
  return (Object.keys(translation).toSorted() as Array<keyof T>).reduce(
    (sorted, key) => {
      sorted[key] = translation[key];

      return sorted;
    },
    {} as T,
  );
}
