# Flash Wallet BDD Challenge Bundle

This bundle contains the app, test setup, and challenge exercises for the Cucumber + Playwright training.

## Contents

- `app/` - the Flash Wallet application used by the tests
- `features/` - ready-made feature files and step definitions
- `world.ts` - the shared setup file for browser context
- `challenges/` - three progressive exercises
- `commands.md` - setup and verification commands

## Setup commands

```bash
npm init -y
npm install @cucumber/cucumber @playwright/test playwright
npm install -D tsx typescript
```

```bash
npx playwright install --with-deps
```

Run the project tests from the root bundle:

```bash
npm test
```

The project script is configured to run Cucumber with the bundle settings, so `npm test` is the correct command.

If you want to invoke Cucumber directly, the TypeScript command is:

```bash
npx cucumber-js --config cucumber.js
```

## Project structure

```text
BDD/
├── app/
│   ├── login.html
│   ├── dashboard.html
│   └── styles.css
├── features/
│   ├── step_definitions/
│   └── *.feature
├── world.ts
├── package.json
├── server.js
├── run-tests.js
├── challenges/
│   ├── challenge-1/
│   ├── challenge-2/
│   └── challenge-3/
└── README.md
```
