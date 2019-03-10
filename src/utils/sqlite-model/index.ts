import * as sqlite3 from 'sqlite3';
import { readFileSync, existsSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import { getLogger, Logger } from '../logger';
import { dirname } from 'path';
import { asyncSecuential } from '../async-secuential';
import { asyncParallel } from '../async-parallel';
import { promisifyStatementResult, SqliteStatement, SqliteSingleResult, SqliteMultipleResult, SqliteNoResult } from './statement';

let sqlite = sqlite3;

export interface SqlModelOptions<Q extends string> {
  /** File where the DB is stored */
  dbPath: string;
  /** If the database doesn't exist, initialize it with the SQL in this files/strings */
  createDbSql: string[];
  /** List of queries to prepare */
  queries: { [K in Q]: string };
  /** Debug mode */
  debug?: boolean;
  /** Name of the table to use for internal management */
  internalTable?: string;
}

export class SqliteModel<Q extends string> {
  protected readonly modelOptions: SqlModelOptions<Q>;
  protected readonly logger: Logger;
  protected readonly stmt: { [K in Q]: SqliteStatement };
  private readonly ready: Promise<void>;
  private db: sqlite3.Database;

  constructor(options: SqlModelOptions<Q>) {
    this.modelOptions = {
      debug: false,
      internalTable: '_model',
      ...options,
    };

    this.logger = getLogger();
    this.stmt = {} as { [K in Q]: SqliteStatement };
    const { debug } = this.modelOptions;

    if (debug) {
      sqlite = sqlite.verbose();
    }

    this.ready = this.openDb().then(() => {});
  }

  /**
   * Return a promise to resolve when the database is ready (or reject if any error)
   *
   * @example
   * const model = new Model(options);
   * await model.isReady();
   * model.foobar();
   */
  public isReady(): Promise<void> {
    return this.ready;
  }

  /**
   * Retrieve the current schema version
   */
  public getCurrentSchemaVersion(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const getVersionSql = `SELECT value FROM ${this.modelOptions.internalTable} WHERE key = ?`;
      this.db.get(getVersionSql, ['version'], (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        const currentVersion = row && Number(row.value);
        resolve(currentVersion);
      });
    });
  }

  /**
   * Read SQL code to execute from a file without the comments, to avoid runtime problems
   * and execute it, resolving or rejecting the returning promise when it finishes
   *
   * @param file Path to the file with SQL code
   */
  protected execSql(sql: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.exec(sql, (error) => {
        if (error) {
          this.logger.log('error', `Error while executing sql (${error})`);
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Return SQL code to execute from a file without the comments, to avoid runtime problems
   *
   * @param file Path to the file with SQL code
   */
  protected async getSqlFromFile(file: string): Promise<string> {
    let sql: string;

    try {
      sql = readFileSync(file)
              .toString()
              .replace(/-- .*\n/gm, '');
    } catch (error) {
      this.logger.log('error', `Error while reading sql from ${file} (${error})`);
    }

    return sql;
  }

  /**
   *
   */
  private openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { dbPath } = this.modelOptions;
      mkdirp(dirname(dbPath));

      this.db = new sqlite3.Database(dbPath, async (error) => {
        if (error) {
          this.logger.log('error', `sqlite: error opening the database ${JSON.stringify(error, null, 2)}`);
          reject(error);
          return;
        }

        if (await this.isNew()) {
          await this.createInternalTable();
          await this.createModelTables();
        }
        await this.prepareStmt();

        resolve();
      });
    });
  }

  /**
   * Check if the model hasn't been initializated yet
   */
  private isNew(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const { internalTable } = this.modelOptions;
      const checkSql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${internalTable}'`;
      this.db.get(checkSql, (error, row) => {
        if (error) {
          this.logger.log('error', `Error while checking for internal table (${error.message})`);
          reject();
          return;
        }

        resolve(!row);
      });
    });
  }

  /**
   * Create the internal table if it doesn't exist
   */
  private createInternalTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { internalTable } = this.modelOptions;
      this.logger.log('info', 'Initializating internal table');
      const sql = `
        CREATE TABLE IF NOT EXISTS ${internalTable} (
          key text NOT NULL PRIMARY KEY,
          value text NOT NULL
        );

        INSERT INTO ${internalTable} VALUES('version', '1');
      `;

      this.db.exec(sql, (error) => {
        if (error) {
          this.logger.log('error', `Error while creating internal table (${error.message})`);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Create the model tables in the database from the specified files or sql
   */
  private async createModelTables(): Promise<void> {
    await asyncSecuential(this.modelOptions.createDbSql, async (fileOrSql) => {
      if (existsSync(fileOrSql)) {
        const sql = await this.getSqlFromFile(fileOrSql);
        return this.execSql(sql);
      }
      return this.execSql(fileOrSql);
    });
  }

  /**
   * Prepare the provided queries as a promisify wrapper around Statement
   */
  private async prepareStmt(): Promise<void> {
    const { queries } = this.modelOptions;
    const logger = this.logger;
    const stmt = this.stmt;

    await asyncParallel(Object.keys(queries), (query) => new Promise((resolve, reject) => {
      this.db.prepare(queries[query], function prepared(error) {
        if (error) {
          logger.log('error', `Error preparing query ${query} (${error.message})`);
          reject(error);
          return;
        }

        stmt[query] = {
          bind: promisifyStatementResult<SqliteNoResult>(this, 'bind'),
          reset: promisifyStatementResult<SqliteNoResult>(this, 'reset'),
          finalize: promisifyStatementResult<SqliteNoResult>(this, 'finalize'),
          run: promisifyStatementResult<SqliteNoResult>(this, 'run'),
          get: promisifyStatementResult<SqliteSingleResult>(this, 'get', 'row'),
          all: promisifyStatementResult<SqliteMultipleResult>(this, 'all', 'rows'),
          each: promisifyStatementResult<SqliteSingleResult>(this, 'each', 'row'),
        };

        resolve();
      });
    }));
  }
}
