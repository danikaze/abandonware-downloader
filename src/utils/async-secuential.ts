/**
 * Executes a callback on each item of the collection, waiting for each one to finish before executing the next one
 *
 * @param collection list of items to iterate
 * @param callback function to call for each item
 * @returns list of returned values of each callback
 */
export async function asyncSecuential<T, R>(collection: T[], callback: (item: T) => Promise<R>): Promise<R[]> {
  const res: R[] = [];

  for (const item of collection) {
    res.push(await callback(item));
  }

  return res;
}
