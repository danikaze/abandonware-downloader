import { existsSync, createWriteStream } from 'fs';
import { join, basename } from 'path';
import { sync as mkdirp } from 'mkdirp';
import * as request from 'request';
import { getLogger } from './logger';


export async function getCookies(uri: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const jar = request.jar();
    request({ uri, jar }, (error) => {
      if (error) {
        getLogger().log('error', `getCookieJar(${uri}) (${error})`);
        reject();
        return;
      }

      resolve(jar.getCookieString(uri));
    });
  });
}

export async function downloadStatic(uri: string, outputFolder: string, options: request.CoreOptions = {}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const logger = getLogger();

    if (!existsSync(outputFolder)) {
      mkdirp(outputFolder);
    }

    let finalPath: string;
    try {
      const requestOptions: request.UriOptions & request.CoreOptions = {
        ...options,
        uri,
      };
      const req = request(requestOptions);
      req.on('complete', () => resolve())
         .on('error', reject)
         .on('response', (response) => {
           finalPath = join(outputFolder, basename(response.request.uri.path));
           logger.log('debug', `downloading static ${uri} => ${finalPath}`);

           const stream = req.pipe(createWriteStream(finalPath));
           stream.on('error', (error) => {
             getLogger().log('error', `downloading static ${uri} => ${finalPath} (${error})`);
             reject();
           });
         });
    } catch (error) {
      getLogger().log('error', `downloadStatic(${uri}, ${outputFolder})`);
      reject();
    }
  });
}
