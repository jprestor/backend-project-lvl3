import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pageLoader from '../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const getFixturePath = (filename) => {
  const { join } = path;
  join(__dirname, '..', '__fixtures__', filename);
};

test('pageLoader', () => {
  expect(pageLoader()).toEqual('Hello World');
});
