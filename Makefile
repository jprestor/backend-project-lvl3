install:
	npm ci

gendiff:
	node bin/page-loader.js

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage

test-watch:
	npm test -- --watch
