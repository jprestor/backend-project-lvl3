import { cwd } from 'process';
import { URL } from 'url';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import axiosDebugLog from 'axios-debug-log'; // eslint-disable-line no-unused-vars
import * as cheerio from 'cheerio';
import prettier from 'prettier';
import debug from 'debug';
import Listr from 'listr';
import genFilename from './genFilename.js';

const logger = debug('page-loader');

const getAttrName = (asset) => {
  if (asset.attr('src')) {
    return 'src';
  }
  return 'href';
};

const filterLocalAssets = (rootOrigin) => (asset) => {
  const src = asset.attr(getAttrName(asset));
  const { origin } = new URL(src, rootOrigin);
  const isLocal = origin === rootOrigin;
  const isHasSrc = src !== undefined;
  return isLocal && isHasSrc;
};

const fetchAsset = (href) => () => {
  const { pathname } = new URL(href);
  const { ext } = path.parse(pathname);
  const responseType = ext ? 'arraybuffer' : '';
  return axios.get(href, { responseType }).then(({ data }) => data);
};

const writeAsset = (href, output) => (data) => {
  const filename = genFilename(href);
  const { pathname } = new URL(href);
  const { ext } = path.parse(pathname);
  const writePath = path.join(output, filename);
  return fs.writeFile(`${writePath}${ext || '.html'}`, data);
};

const changeAssetSrc = (asset, href, dirname) => () => {
  const filename = genFilename(href);
  const { pathname } = new URL(href);
  const { ext } = path.parse(pathname);
  const assetNewSrc = path.join(dirname, `${filename}${ext || '.html'}`);
  asset.attr(getAttrName(asset), assetNewSrc);
};

const pageLoader = (url, output = cwd()) => {
  const { origin } = new URL(url);
  const rootName = genFilename(url);
  const outputHtmlPath = path.join(output, `${rootName}.html`);
  const assetsDirName = `${rootName}_files`;
  const outputAssetsPath = path.join(output, assetsDirName);

  let $;
  const assets = [];

  logger('create local directory for page assets');
  return fs
    .mkdir(outputAssetsPath)
    .catch(() => {})
    .then(() => {
      logger(`fetch page from url: ${url}`);
      return axios.get(url);
    })
    .then(({ data }) => {
      $ = cheerio.load(data);

      function getAssets() {
        assets.push($(this));
      }

      logger('collect page assets by cheerio');
      $('img, link, script').each(getAssets);

      logger('fetch assets sources and write it to files');
      const tasks = new Listr(
        assets.filter(filterLocalAssets(origin)).map((asset) => {
          const src = asset.attr(getAttrName(asset));
          const { href } = new URL(src, origin);

          return {
            title: href,
            task: () =>
              Promise.resolve() // eslint-disable-line implicit-arrow-linebreak
                .then(fetchAsset(href))
                .then(writeAsset(href, outputAssetsPath))
                .then(changeAssetSrc(asset, href, assetsDirName)),
          };
        }),
        { concurrent: true },
      );

      return tasks.run();
    })
    .then(() => {
      const html = $.root().html();
      const prettified = prettier.format(html, { parser: 'html' });
      logger('write main html');
      return fs.writeFile(outputHtmlPath, prettified);
    })
    .then(() => path.resolve(outputHtmlPath));
};

export default pageLoader;
