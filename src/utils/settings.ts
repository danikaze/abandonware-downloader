import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Settings } from '../interfaces';
import { getLogger } from './logger';

let settings: Settings;
const ONE_HOUR_SEC = 3600;
const ONE_WEEK_SEC = 3600 * 24 * 7; // tslint:disable-line:no-magic-numbers

export function validateSettings(settings: Settings): Settings {
  const defaultValues: Partial<Settings> = {
    internalDataPath: '[app]/../.abandonware-dl',
    cacheGameInfoTtl: ONE_WEEK_SEC,
    cacheIndexTtl: ONE_HOUR_SEC,
    debugCode: false,
    log: [{
      level: 'error',
      colors: true,
    }],
  };
  const requiredKeys = ['gameDownloadsPath', 'gameScreenshotsPath', 'gameInfoPath'];
  const missingKeys = [];

  // check required keys
  requiredKeys.forEach((key) => {
    if (!settings[key]) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length > 0) {
    getLogger().log('crit', `Missing settings for: [${missingKeys.join(', ')}]`);
    process.exit();
  }

  // replace [cwd] and [app] in paths
  const extendedSettings = {
    ...defaultValues,
    ...settings,
  };

  const appPath = join(__dirname, '..');
  Object.keys(extendedSettings).forEach((key) => {
    if (/Path$/.test(key)) {
      extendedSettings[key] = extendedSettings[key].replace(/\[app\]/gi, appPath);
      extendedSettings[key] = extendedSettings[key].replace(/\[cwd\]/gi, process.cwd);
    }
  });

  return extendedSettings;
}

export function loadSettings(filepath: string): Settings {
  try {
    settings = JSON.parse(readFileSync(filepath).toString()) as Settings;
    settings = validateSettings(settings);
  } catch (e) {
    const logger = getLogger();
    logger.log('crit', e);
    process.exit(1);
  }

  return settings;
}

export function getSettingsPath(): string {
  const paramIndex = process.argv.indexOf('--config');
  if (paramIndex !== -1) {
    const paramValue = process.argv[paramIndex + 1];

    // abs
    let route = paramValue;
    if (existsSync(route)) {
      return route;
    }

    // relative to cwd
    route = join(process.cwd(), route);
    if (existsSync(route)) {
      return route;
    }

    // relative to the executable
    route = join(__dirname, '..', route);
    if (existsSync(route)) {
      return route;
    }

    const logger = getLogger();
    logger.log('warn', `Can't find settings file in ${paramValue}`);
  }

  // default
  return join(__dirname, '..', 'settings.json');
}

export function getSettings(): Settings {
  return settings;
}
