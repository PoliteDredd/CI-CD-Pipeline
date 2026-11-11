# Setup and run commands

## Install dependencies

```bash
npm init -y
npm install @cucumber/cucumber @playwright/test playwright
npm install -D tsx typescript
```

## Install browsers

```bash
npx playwright install --with-deps
```

## Start the app

```bash
node server.js
```

Then open:

```text
http://127.0.0.1:4174/login.html
```

## Run the feature files

### JavaScript

```bash
npx cucumber-js --require './features/**/*.js' --format progress
```

### TypeScript

```bash
npx cucumber-js --require-module tsx/cjs --require './features/**/*.ts' --format progress
```

## Quick sanity checks

- Make sure the app is running on port 4174.
- Make sure `@cucumber/cucumber` and `@playwright/test` are installed.
- Make sure `playwright` browsers are installed.
- Check that the feature names match the step definitions exactly.
- Check that the `.feature` file and `.steps.ts` file are loaded by the same Cucumber config.
