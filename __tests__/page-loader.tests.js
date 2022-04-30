import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs, constants } from 'fs';
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
let outputDir;
let outputPath;
let inputHTML;
let expectedHTML;
const expectedAssetPath =
  'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png';

beforeAll(async () => {
  inputHTML = await readFixture('original.html');
  expectedHTML = await readFixture('expected.html');
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  outputPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
});

it('write file and return path', async () => {
  nock(host).get(pathname).reply(200, inputHTML); // expectedHTML
  const resultPath = await pageLoader(`${host}${pathname}`, outputDir);
  const resultHTML = await fs.readFile(outputPath, 'utf-8');
  const assetExist = await fs
    .access(expectedAssetPath, constants.F_OK)
    .then(() => true)
    .catch(() => false);

  expect(resultPath).toEqual(outputPath);
  expect(resultHTML).toEqual(expectedHTML);
  expect(assetExist).toBeTruthy();
});
