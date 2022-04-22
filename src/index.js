import { cwd } from 'process';
import { URL } from 'url';
import { promises as fs } from 'fs';
import { resolve } from 'path';
import axios from 'axios';

const getUrlWithoutProtocol = (url) => {
  const { protocol } = new URL(url);
  return url.replace(`${protocol}//`, '');
};

const getFilename = (url) => {
  const urlWithoutProtocol = getUrlWithoutProtocol(url);
  const regex = /[^0-9a-zA-Z]/g;
  return urlWithoutProtocol.replace(regex, '-');
};

const pageLoader = (url, output = cwd()) => {
  const filename = getFilename(url);
  const outputPath = `${output}/${filename}.html`;

  return axios
    .get(url)
    .then((response) => {
      const { data } = response;
      return fs.writeFile(outputPath, data);
    })
    .then(() => resolve(outputPath));
};

export default pageLoader;
