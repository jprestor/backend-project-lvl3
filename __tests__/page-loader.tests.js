import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs, { promises as fsp } from 'fs';
import os from 'os';
import pageLoader from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => {
  const { join } = path;
  join(__dirname, '..', '__fixtures__', filename);
};

beforeEach(async () => {
  await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

it('returns', () => {
  expect(pageLoader()).toEqual('Hello World');
});
