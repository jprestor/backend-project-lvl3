import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import nock from 'nock';
import os from 'os';
import pageLoader from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getFixturePath = (filename) => {
  const { join } = path;
  return join(__dirname, '..', '__fixtures__', filename);
};

nock.disableNetConnect();

let url;
let filename;
let endDir;
let endPath;
let expectedData;

beforeAll(async () => {
  url = {
    host: 'https://ru.hexlet.io',
    pathname: '/courses',
  };
  filename = 'ru-hexlet-io-courses.html';
  const fixturePath = getFixturePath(filename);
  expectedData = await fs.readFile(fixturePath, 'utf-8');
});

beforeEach(async () => {
  endDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  endPath = path.join(endDir, filename);
});

test('pageLoader', async () => {
  const { host, pathname } = url;
  nock(host).get(pathname).reply(200, expectedData);
  const resultPath = await pageLoader(`${host}${pathname}`, endDir);
  const resultData = await fs.readFile(endPath, 'utf-8');

  expect(resultPath).toEqual(endPath);
  expect(resultData).toEqual(expectedData);
});
