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
  expectedHTML = await readFixture('expected.html');
  inputAssetCss = await readFixture('/assets/application.css', '');
  inputAssetImage = await readFixture('/assets/nodejs.png', '');
  inputAssetJs = await readFixture('/assets/runtime.js', '');
});

beforeEach(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  outputHtmlPath = path.join(outputDir, 'ru-hexlet-io-courses.html');
  outputAssetPath = path.join(outputDir, 'ru-hexlet-io-courses_files');

  nock(host)
    .persist()
    .get(pathname)
    .reply(200, inputHTML)
    .get('/assets/application.css')
    .reply(200, inputAssetCss)
    .get('/assets/professions/nodejs.png')
    .reply(200, inputAssetImage)
    .get('/packs/js/runtime.js')
    .reply(200, inputAssetJs);
});

it('load page with assets and return root html path', async () => {
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
  const resultAssetHTML = await fs.readFile(
    `${outputAssetPath}/ru-hexlet-io-courses.html`,
    'utf-8',
  );

  expect(resultPath).toEqual(outputHtmlPath);
  expect(resultHTML).toEqual(expectedHTML);
  expect(resultAssetCss).toEqual(inputAssetCss);
  expect(resultAssetImage).toEqual(inputAssetImage);
  expect(resultAssetJs).toEqual(inputAssetJs);
  expect(resultAssetHTML).toEqual(inputHTML);
});

it('fails with not exist output dir', async () => {
  const wrongOutput = '/not/exist/dir';
  await expect(pageLoader(`${host}${pathname}`, wrongOutput)).rejects.toThrow();
});

it('fails with not exist url', async () => {
  const wrongHost = 'https://notexist.no';
  nock(wrongHost).get('/').reply(500);
  await expect(pageLoader(wrongHost, outputDir)).rejects.toThrow();
});

it('fails with not exist page', async () => {
  expect.assertions(1);
  const wrongPathname = '/not/exist/page';
  nock(host).get(wrongPathname).reply(404);

  await pageLoader(`${host}${wrongPathname}`, outputDir).catch((e) => {
    const responseStatus = e.response.status;
    expect(responseStatus).toBe(404);
  });
});
