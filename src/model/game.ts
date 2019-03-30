import { SqliteModel, SqlModelOptions } from '../utils/sqlite-model';
import { GameInfo, Platform } from '../interfaces';
import { initSql, queriesSql } from './game-sql';
import { getSettings } from '../utils/settings';
import { join } from 'path';

type Query = 'insertGame'
           | 'selectGame'
           | 'selectGameIdByUrl'
           | 'deleteGame'
           | 'insertGameMeta'
           | 'selectGameMetas'
           | 'insertGameLink'
           | 'selectGameLinks'
           | 'insertGameScreenshot'
           | 'selectGameScreenshots'
           | 'insertLinkMeta'
           | 'selectLinkMetas'
           | 'insertLinkLang'
           | 'selectLinkLangs'
           ;

export interface FilterOptions {
  name?: string;
  year?: number;
  platform?: Platform;
  limit?: number;
  offset?: number;
  orderBy?: Array<'name' | 'year' | 'score' | 'platform'>;
  sortDesc?: boolean;
}

export class Game extends SqliteModel<Query> {
  constructor() {
    const modelOptions: SqlModelOptions<Query> = {
      dbPath: join(getSettings().internalDataPath, 'data.db'),
      createDbSql: [initSql],
      queries: queriesSql,
      debug: true,
    };

    super(modelOptions);
  }

  /**
   * Accept a `GameInfo` object and stores it in the database
   * If it already exists, just get its id
   */
  public async set(game: GameInfo): Promise<number> {
    await this.isReady();

    let gameId;
    const {
      insertGame,
      insertGameMeta,
      insertGameLink,
      insertGameScreenshot,
      insertLinkLang,
      insertLinkMeta,
      selectGameIdByUrl,
    } = this.stmt;

    return insertGame.run(
      game.pageUrl,
      game.name,
      game.year,
      game.platform,
      game.score,
      game.votes,
      game.description,
      game.playOnlineLink,
      game.howTo,
    ).then(async (res) => {
      if (res.result.changes === 0) {
        return selectGameIdByUrl.get(game.pageUrl).then((res) => res.row.id);
      }

      gameId = res.result.lastID;
      const promises = [];

      Object.keys(game.meta).forEach((key) => {
        promises.push(insertGameMeta.run(gameId, key, game.meta[key]));
      });

      game.downloadLinks.forEach((link) => {
        promises.push(insertGameLink.run(
          gameId,
          link.url.remote,
          link.url.local,
          link.year,
          link.platform,
          link.info,
        ).then(async (res) => {
          const linkId = res.result.lastID;
          const linkPromises = [];

          if (link.languages) {
            link.languages.forEach((lang) => {
              linkPromises.push(insertLinkLang.run(linkId, lang));
            });
          }

          if (link.meta) {
            Object.keys(link.meta).forEach((key) => {
              linkPromises.push(insertLinkMeta.run(linkId, key, link.meta[key]));
            });
          }

          await Promise.all(linkPromises);
        }));
      });

      if (game.screenshots) {
        Object.keys(game.screenshots).forEach((platform) => {
          game.screenshots[platform].forEach((screenshot) => {
            promises.push(insertGameScreenshot.run(
              gameId,
              platform,
              screenshot.remote,
              screenshot.local,
            ));
          });
        });
      }

      await Promise.all(promises);
      return gameId;
    });
  }

  /**
   * Get data from the database and return a `GameInfo` object or `undefined` if not found
   */
  public async get(id: number): Promise<GameInfo> {
    await this.isReady();
    const { selectGame, selectGameMetas, selectGameScreenshots, selectGameLinks } = this.stmt;

    return selectGame.get(id).then(async (result) => {
      const { row } = result;

      if (!row) {
        return;
      }

      const promises = [];
      const gameInfo: GameInfo = {
        pageUrl: row.page_url,
        platform: row.platform,
        updated: row.updated,
        name: row.name,
        year: row.year,
        score: row.score,
        votes: row.votes,
        description: row.description,
        playOnlineLink: row.play_online_link,
        howTo: row.how_to,
        meta: {},
        screenshots: {},
      };

      promises.push(selectGameMetas.all(id).then((result) => {
        result.rows.forEach((meta) => {
          gameInfo.meta[meta.key] = meta.value;
        });
      }));

      promises.push(selectGameScreenshots.all(id).then((result) => {
        result.rows.forEach((screenshot) => {
          let platform = gameInfo.screenshots[screenshot.platform];
          if (!platform) {
            gameInfo.screenshots[screenshot.platform] = [];
            platform = gameInfo.screenshots[screenshot.platform];
          }

          platform.push({
            remote: screenshot.url,
            local: screenshot.local,
          });
        });
      }));

      promises.push(selectGameLinks.all(id).then(async (result) => {
        const { selectLinkMetas, selectLinkLangs } = this.stmt;
        const linkPromises = [];
        gameInfo.downloadLinks = result.rows.map((link) => {
          const res = {
            url: {
              remote: link.url,
              local: link.local,
            },
            year: link.year,
            platform: link.platform,
            info: link.info,
            meta: {},
            languages: [],
          };

          linkPromises.push(selectLinkMetas.all(link.id).then((result) => {
            result.rows.forEach((row) => {
              res.meta[row.key] = row.value;
            });
          }));

          linkPromises.push(selectLinkLangs.all(link.id).then((result) => {
            result.rows.forEach((row) => res.languages.push(row.lang));
          }));

          return res;
        });

        await Promise.all(linkPromises);
      }));

      await Promise.all(promises);
      return gameInfo;
    });
  }

  /**
   * Remove data from the database (it doesn't affect local files)
   */
  public async remove(id: number): Promise<void> {
    await this.isReady();
    await this.stmt.deleteGame.run(id);
  }

  /**
   * Search in the database with the passed options and retrieve the information for all the matches
   */
  public async search(filter: FilterOptions): Promise<GameInfo[]> {
    const sql = this.createFilterStmt(filter);
    const stmt = await this.prepareStmt(sql);

    return stmt.all().then((result) => result.rows);
  }

  /**
   * Construct the SQL query to run from the filter parameters
   */
  private createFilterStmt(filter: FilterOptions): string {
    const conditions = [];

    if (filter.name) {
      conditions.push(`name LIKE "%${filter.name}%"`);
    }

    if (filter.platform) {
      conditions.push(`platform LIKE "%${filter.platform}%"`);
    }

    if (filter.year) {
      conditions.push(`year = ${filter.year}`);
    }

    if (conditions.length === 0) {
      return;
    }

    const sortOrder = filter.sortDesc ? ' DESC' : ' ASC';
    const orderBy = filter.orderBy && filter.orderBy.length > 0
      ? ` ORDER BY ${filter.orderBy.join(', ')} ${sortOrder}`
      : ` ORDER BY id ${sortOrder}`;

    const limit = ` LIMIT ${filter.limit ? filter.limit : -1} ${filter.offset ? `OFFSET ${filter.offset}` : ''}`;

    return `SELECT * FROM games
            WHERE ${conditions.join(' AND ')}
            ${orderBy}
            ${limit}
            ;`;
  }
}
