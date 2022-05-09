import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = async (filename, encoding = 'utf-8') => {
  const fixturePath = getFixturePath(filename);
  return fs.readFile(fixturePath, encoding);
};

nock.disableNetConnect();

const host = 'https://ru.hexlet.io';
const pathname = '/courses';
const assetPath = '/assets/';
let outputDir;
let outputHtmlPath;
let outputAssetPath;
let inputHTML;
let inputAssetCss;
let inputAssetImage;
let inputAssetJs;
let expectedHTML;

beforeAll(async () => {
  inputHTML = await readFixture('original.html');
  inputAssetCss = await readFixture(`${assetPath}application.css`, '');
  inputAssetImage = await readFixture(`${assetPath}nodejs.png`, '');
  inputAssetJs = await readFixture(`${assetPath}runtime.js`, '');
  expectedHTML = await readFixture('expected.html');
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  outputHtmlPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
  outputAssetPath = path.join(outputDir, 'ru-hexlet-io-courses_files');
});

it('load html and return its path', async () => {
  nock(host).persist().get(pathname).reply(200, inputHTML);
  nock(host).get('/assets/application.css').reply(200, inputAssetCss);
  nock(host).get('/assets/professions/nodejs.png').reply(200, inputAssetImage);
  nock(host).get('/packs/js/runtime.js').reply(200, inputAssetJs);

  const resultPath = await pageLoader(`${host}${pathname}`, outputDir);
  const resultHTML = await fs.readFile(outputHtmlPath, 'utf-8');
  const resultAssetCss = await fs.readFile(
    `${outputAssetPath}/ru-hexlet-io-assets-application.css`,
    '',
  );
  const resultAssetImage = await fs.readFile(
    `${outputAssetPath}/ru-hexlet-io-assets-professions-nodejs.png`,
    '',
  );
  const resultAssetJs = await fs.readFile(
    `${outputAssetPath}/ru-hexlet-io-packs-js-runtime.js`,
    '',
  );
  // const resultAssetHTML = await fs.readFile(
  //   `${outputAssetPath}/ru-hexlet-io-courses.html`,
  //   '',
  // );

  expect(resultPath).toEqual(outputHtmlPath);
  expect(resultHTML).toEqual(expectedHTML);
  expect(resultAssetCss).toEqual(inputAssetCss);
  expect(resultAssetImage).toEqual(inputAssetImage);
  expect(resultAssetJs).toEqual(inputAssetJs);
  // expect(resultAssetHTML).toEqual(inputHTML);
});
