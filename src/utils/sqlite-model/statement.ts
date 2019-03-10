// tslint:disable:no-any
import * as sqlite3 from 'sqlite3';

export interface SqliteNoResult {
  result: sqlite3.RunResult;
}

export interface SqliteSingleResult<T = any> extends SqliteNoResult {
  row?: T;
}

export interface SqliteMultipleResult<T = any> extends SqliteNoResult {
  rows: T[];
}

export interface SqliteStatement {
  bind(...params: any[]): Promise<SqliteNoResult>;
  reset(): Promise<SqliteNoResult>;
  finalize(): Promise<SqliteNoResult>;
  run(...params: any[]): Promise<SqliteNoResult>;
  get<T = any>(...params: any[]): Promise<SqliteSingleResult<T>>;
  all<T = any>(...params: any[]): Promise<SqliteMultipleResult<T>>;
  each<T = any>(...params: any[]): Promise<SqliteSingleResult<T>>;
}

export function promisifyStatementResult<R = SqliteNoResult | SqliteSingleResult | SqliteMultipleResult>(
  stmt: sqlite3.Statement,
  method: 'bind' | 'reset' | 'finalize' | 'run' | 'get' | 'all' | 'each',
  field?: 'row' | 'rows',
): (...params: any[]) => Promise<R> {
  return (...params) => new Promise<R>((resolve, reject) => {
    stmt[method](...params, function handler(error: Error, r?: any | any[]) {
      if (error) {
        reject(error);
        return;
      }

      const data: SqliteNoResult | SqliteMultipleResult | Partial<SqliteSingleResult> = {
        result: this,
      };

      if (field && r) {
        data[field] = r;
      }

      resolve(data as R);
    });
  });
}
