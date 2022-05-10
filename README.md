# backend-project-lvl3 (Page Loader)

[![Maintainability](https://api.codeclimate.com/v1/badges/5c946b0eaf3e88bff593/maintainability)](https://codeclimate.com/github/jprestor/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5c946b0eaf3e88bff593/test_coverage)](https://codeclimate.com/github/jprestor/backend-project-lvl3/test_coverage)
[![Hexlet Workflow Status](https://github.com/jprestor/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/jprestor/backend-project-lvl3/actions)
[![My Workflow Status](https://github.com/jprestor/backend-project-lvl3/actions/workflows/my-workflow.yml/badge.svg)](https://github.com/jprestor/backend-project-lvl3/actions/workflows/my-workflow.yml)

PageLoader is a command–line utility that downloads pages from the Internet and saves them on your computer. Together with the page, it downloads all resources (pictures, styles and js), making it possible to open the page without the Internet.

## Requirements

Node.js version 14 and above

## Setup

```sh
make install
```

```sh
npm link
```

## Run

```sh
page-loader --output /var/tmp https://ru.hexlet.io/courses
```

#### Help

```sh
page-loader -h
```

## Demo

Load page and return its output path
[![asciicast](https://asciinema.org/a/493444.svg)](https://asciinema.org/a/493444)

Logging by [debug](https://www.npmjs.com/package/debug)
[![asciicast](https://asciinema.org/a/jtPCutY8bstykUizeYlva8M3J.svg)](https://asciinema.org/a/jtPCutY8bstykUizeYlva8M3J)

View error messages if something went wrong
[![asciicast](https://asciinema.org/a/493364.svg)](https://asciinema.org/a/493364)
