import { URL } from 'url';
import path from 'path';

const genFilename = (url) => {
  const { host, pathname } = new URL(url);
  const { dir, name, ext } = path.parse(pathname);
  const string = path.join(host, dir, name);

  const regexReplaceSymbols = /[^0-9a-zA-Z]/g;
  const regexReplaceTrailingSlash = /\/$/;

  const filename = string
    .replace(regexReplaceTrailingSlash, '')
    .replace(regexReplaceSymbols, '-');

  return `${filename}${ext}`;
};

export default genFilename;
