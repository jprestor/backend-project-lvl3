import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) =>
  path.join(__dirname, '..', '__fixtures__', filename);

const readFixture = async (filename, encoding = 'utf-8') =>
  fs.readFile(getFixturePath(filename), encoding);

nock.disableNetConnect();

const host = 'https://ru.hexlet.io';
const pathname = '/courses';
const assetPath = '/assets/professions/nodejs.png';
let outputDir;
let outputHtmlPath;
let outputAssetPath;
let inputHTML;
let inputAsset;
let expectedHTML;

beforeAll(async () => {
  inputHTML = await readFixture('original.html');
  inputAsset = await readFixture(assetPath, '');
  expectedHTML = await readFixture('expected.html');
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  outputHtmlPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
  outputAssetPath = path.join(
    outputDir,
    'ru-hexlet-io-courses_files',
    'ru-hexlet-io-assets-professions-nodejs.png',
  );
});

it('write file and return path', async () => {
  nock(host).get(pathname).reply(200, inputHTML);
  nock(host).get(assetPath).reply(200, inputAsset);
  const resultPath = await pageLoader(`${host}${pathname}`, outputDir);
  const resultHTML = await fs.readFile(outputHtmlPath, 'utf-8');
  const resultAsset = await fs.readFile(outputAssetPath, '');

  expect(resultPath).toEqual(outputHtmlPath);
  expect(resultHTML).toEqual(expectedHTML);
  expect(resultAsset).toEqual(inputAsset);
});
