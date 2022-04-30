import { cwd } from 'process';
import { URL } from 'url';
import { promises as fs } from 'fs';
import { resolve, join, extname, basename } from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const genFilename = (url) => {
  const regex = /[^0-9a-zA-Z]/g;
  return url.replace(regex, '-');
};

const pageLoader = (url, output = cwd()) => {
  const { origin, host, pathname } = new URL(url);
  const filename = genFilename(`${host}`);
  const assetsFormats = ['.png', '.jpg'];
  const outputHtmlPath = join(output, `${filename}.html`);
  const outputAssetsPath = join(output, `${filename}_files`);

  let $;

  return fs
    .mkdir(outputAssetsPath)
    .catch(() => {})
    .then(() => axios.get(url))
    .then(({ data }) => {
      $ = cheerio.load(data);
      return fs.writeFile(outputHtmlPath, data);
    })
    .then(() => {
      const initPromise = Promise.resolve([]);

      $('img').each(function () {
        const src = $(this).attr('src');
        const { host: assetHost, href } = new URL(src, origin);
        const extName = extname(src);
        const baseName = basename(src, extName);
        const isLocal = assetHost === host;
        const isSupported = assetsFormats.includes(extName);

        console.log(src);
        if (isLocal && isSupported) {
          initPromise
            .then(() => axios.get(href, { responseType: 'arraybuffer' }))
            .then(({ data: assetData }) => {
              const assetFilename = genFilename(`${host}${baseName}`);
              const outputFilePath = join(
                outputAssetsPath,
                `${assetFilename}${extName}`,
              );
              return fs.writeFile(outputFilePath, assetData, '');
            });
        }
      });

      return initPromise;
    })
    .then(() => resolve(outputHtmlPath));
};

export default pageLoader;
