import { cwd } from 'process';
import { URL } from 'url';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import prettier from 'prettier';
import genFilename from './genFilename.js';

const filterSupportedAssets = (rootOrigin) => (asset) => {
  const formats = ['.png', '.jpg'];
  const src = asset.attr('src');
  const { origin, pathname } = new URL(src, rootOrigin);
  const ext = path.extname(pathname);
  const isLocal = origin === rootOrigin;
  const isSupported = formats.includes(ext);

  return isLocal && isSupported;
};

const fetchAsset = (href) => () =>
  axios.get(href, { responseType: 'arraybuffer' }).then(({ data }) => data);

const writeAsset = (href, output) => (data) => {
  const filename = genFilename(href);
  const writePath = path.join(output, filename);
  return fs.writeFile(writePath, data);
};

const changeAssetSrc = (asset, href, dirname) => () => {
  const filename = genFilename(href);
  const assetNewSrc = path.join(dirname, filename);
  asset.attr('src', assetNewSrc);
};

const pageLoader = (url, output = cwd()) => {
  const { origin } = new URL(url);
  const rootName = genFilename(url);
  const outputHtmlPath = path.join(output, `${rootName}.html`);
  const assetsDirName = `${rootName}_files`;
  const outputAssetsPath = path.join(output, assetsDirName);

  let $;
  const assets = [];

  return fs
    .mkdir(outputAssetsPath)
    .catch(() => console.log('Assets dir already exists'))
    .then(() => axios.get(url))
    .then(({ data }) => {
      $ = cheerio.load(data);

      function getAssets() {
        assets.push($(this));
      }

      $('img').each(getAssets);

      const promises = assets
        .filter(filterSupportedAssets(origin))
        .map((asset) => {
          const src = asset.attr('src');
          const { href } = new URL(src, origin);

          return Promise.resolve()
            .then(fetchAsset(href))
            .then(writeAsset(href, outputAssetsPath))
            .then(changeAssetSrc(asset, href, assetsDirName));
        });

      return Promise.all(promises);
    })
    .then(() => {
      const html = $.root().html();
      const prettified = prettier.format(html, { parser: 'html' });
      return fs.writeFile(outputHtmlPath, prettified);
    })
    .then(() => path.resolve(outputHtmlPath));
};

export default pageLoader;
