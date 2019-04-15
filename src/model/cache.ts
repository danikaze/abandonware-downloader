import { SqliteModel, SqliteModelOptions, SqliteStatement } from 'sqlite-model';

export interface CacheOptions {
  /** where cached data will be stored */
  path: string;
  /** time in seconds before invalidating data */
  ttl: number;
  /** if `false`, will leave expired cache files without removing them */
  cleanExpired?: boolean;
  /** if `true`, stored data (json) will be tabulated and sql database will be in debug mode */
  verbose?: boolean;
}

export interface PurgedData {
  existingFiles: number;
  removedFiles: number;
}

type Query = 'set' | 'update' | 'get' | 'remove' | 'purge' | 'allKeys' | 'validKeys' | 'expiredKeys';

export class Cache extends SqliteModel<Query> {
  private static readonly initSql = `
    CREATE TABLE IF NOT EXISTS cache (
      key text NOT NULL PRIMARY KEY,
      value text NOT NULL,
      expireson integer NOT NULL
    );
  `;
  private static readonly queries: {[key in Query]: string } = {
    set: 'INSERT INTO cache VALUES(?, ?, ?);',
    update: 'UPDATE cache SET value = ?, expireson = ? WHERE key = ?;',
    get: 'SELECT value FROM cache WHERE key = ? AND expireson >= ?;',
    remove: 'DELETE FROM cache WHERE key = ?',
    purge: 'DELETE FROM cache WHERE expireson < ?',
    allKeys: 'SELECT key FROM cache',
    validKeys: 'SELECT key FROM cache WHERE expireson >= ?',
    expiredKeys: 'SELECT key FROM cache WHERE expireson < ?',
  };
  protected readonly options: CacheOptions;

  constructor(options: CacheOptions) {
    const opt: CacheOptions = {
      cleanExpired: true,
      verbose: false,
      ...options,
    };

    const modelOptions: SqliteModelOptions<Query> = {
      dbPath: opt.path,
      createDbSql: [Cache.initSql],
      queries: Cache.queries,
      verbose: opt.verbose,
    };

    super(modelOptions);
    this.options = opt;
  }

  public async set<T>(key: string, data: T): Promise<void> {
    await this.isReady();

    const expireson = new Date().getTime() + (this.options.ttl * 1000);
    let json: string;

    try {
      json = JSON.stringify(data);
    } catch (error) {
      return;
    }

    try {
      await this.stmt.set.run(key, json, expireson);
    } catch (error) {
      await this.stmt.update.run(json, expireson, key);
    }
  }

  public async get<T>(key: string): Promise<T> {
    await this.isReady();

    try {
      const { row } = await this.stmt.get.get<{ value: string }>(key, new Date().getTime());
      const res = row && JSON.parse(row.value) as T;
      return res;
    } catch (error) {
      return;
    }
  }

  public async remove(key: string): Promise<void> {
    await this.isReady();

    try {
      await this.stmt.remove.run(key);
    } catch (error) {
    }
  }

  public async purge(): Promise<void> {
    await this.isReady();

    try {
      await this.stmt.purge.run(new Date().getTime());
    } catch (error) {
    }
  }

  public async keys(filter: 'all' | 'valid' | 'expired' = 'all'): Promise<string[]> {
    await this.isReady();

    const stmt = this.stmt[`${filter}Keys`] as SqliteStatement;
    const param = filter === 'all' ? undefined : new Date().getTime();

    return stmt.all(param).then((result) => {
      return result.rows.map((row) => row.key);
    });
  }
}
