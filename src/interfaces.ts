export type Dict<T> = { [key: string]: T };

export interface Link {
  url: string;
  info: string;
  languages: string;
  meta?: Dict<string>;
}

export interface GameInfo {
  pageUrl: string;
  updated: number;
  name?: string;
  meta?: Dict<string>;
  score?: number;
  votes?: number;
  description?: string;
  playOnlineLink?: string;
  downloadLinks?: Link[];
  screenshots?: Dict<string[]>; // { platform: urls[] }
  howTo?: string;
}
