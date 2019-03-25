export const initSql = `
  CREATE TABLE IF NOT EXISTS games (
    id integer NOT NULL PRIMARY KEY,
    created text NOT NULL DEFAULT (datetime('now', 'utc')),
    updated text NOT NULL DEFAULT (datetime('now', 'utc')),
    page_url text NOT NULL UNIQUE ON CONFLICT IGNORE,
    name text,
    year integer,
    platform text,
    score integer,
    votes integer,
    description text,
    play_online_link text,
    how_to text
  );

  CREATE TABLE IF NOT EXISTS game_metas (
    id integer NOT NULL PRIMARY KEY,
    game_id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,

    FOREIGN KEY (game_id) REFERENCES games(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_screenshots (
    id integer NOT NULL PRIMARY KEY,
    game_id integer NOT NULL,
    platform text NOT NULL,
    url text NOT NULL,
    local text,

    FOREIGN KEY (game_id) REFERENCES games(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_links (
    id integer NOT NULL PRIMARY KEY,
    game_id integer NOT NULL,
    url text NOT NULL,
    local text,
    year integer,
    platform text,
    info text,

    FOREIGN KEY (game_id) REFERENCES games(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS link_metas (
    id integer NOT NULL PRIMARY KEY,
    link_id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,

    FOREIGN KEY (link_id) REFERENCES links(id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS link_langs (
    link_id integer NOT NULL,
    lang text NOT NULL,

    UNIQUE(link_id, lang) ON CONFLICT IGNORE
  );
`;

export const queriesSql = {
  insertGame: `INSERT INTO games
  (
    page_url,
    name,
    year,
    platform,
    score,
    votes,
    description,
    play_online_link,
    how_to
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  selectGame: 'SELECT * FROM games WHERE id = ?;',
  selectGameIdByUrl: 'SELECT id FROM games WHERE page_url = ?;',
  deleteGame: 'DELETE FROM games WHERE id = ?;',

  insertGameMeta: 'INSERT INTO game_metas(game_id, key, value) VALUES(?, ?, ?);',
  selectGameMetas: 'SELECT * FROM game_metas WHERE game_id = ?;',

  insertGameScreenshot: 'INSERT INTO game_screenshots(game_id, platform, url, local) VALUES(?, ?, ?, ?);',
  selectGameScreenshots: 'SELECT * FROM game_screenshots WHERE game_id = ?;',

  insertGameLink: 'INSERT INTO game_links(game_id, url, local, year, platform, info) VALUES(?, ?, ?, ?, ?, ?);',
  selectGameLinks: 'SELECT * FROM game_links WHERE game_id = ?;',

  insertLinkMeta: 'INSERT INTO link_metas(link_id, key, value) VALUES(?, ?, ?);',
  selectLinkMetas: 'SELECT * FROM link_metas WHERE link_id = ?;',

  insertLinkLang: 'INSERT INTO link_langs(link_id, lang) VALUES(?, ?);',
  selectLinkLangs: 'SELECT * FROM link_langs WHERE link_id = ?;',
};
