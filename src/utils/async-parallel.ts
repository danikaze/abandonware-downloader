/**
 * Executes a callback on each item of the collection, but wait for all of them to finish (or one to fail)
 *
 * @param collection list of items to iterate
 * @param callback function to call for each item
 * @returns list of returned values of each callback
 */
export async function asyncParallel<T, R>(collection: T[], callback: (item: T) => Promise<R>): Promise<R[]> {
  const promises = collection.map(callback);

  return Promise.all(promises);
}
