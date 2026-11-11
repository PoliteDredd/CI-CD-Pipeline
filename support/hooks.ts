
import { BeforeAll, Before, After, AfterAll, Status } from '@cucumber/cucumber';
import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { chromium, request, type Browser } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { waitForServer } from './api-helpers';
import { DataBundleWorld } from './world';

const BASE_URL = 'http://localhost:3003';

let server: ChildProcess;
let browser: Browser | undefined;

BeforeAll(async function () {
  server = spawn('node', ['data-app/server.js'], {
    stdio: 'ignore'
  });

  try {
    await waitForServer(`${BASE_URL}/api/bundles`);

    browser = await chromium.launch({
      headless: true
    });
  } catch (error) {
    server.kill();
    throw error;
  }
});

Before(async function (this: DataBundleWorld) {
  if (!browser) {
    throw new Error('The Playwright browser was not started');
  }

  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  this.api = await request.newContext({
    baseURL: BASE_URL
  });
  this.purchaseReferences = [];
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  this.traceStarted = true;
});

After(async function (
  this: DataBundleWorld,
  { result, pickle }: ITestCaseHookParameter
) {
  const failed = result?.status === Status.FAILED;

  try {
    if (failed && this.page) {
      const screenshot = await this.page.screenshot({
        fullPage: true
      });
      this.attach(screenshot, 'image/png');
    }
  } finally {
    try {
      if (this.traceStarted) {
        if (failed) {
          await mkdir('reports/traces', { recursive: true });
          const name = `${pickle.name}-${pickle.id}`.replace(/[^\w-]+/g, '-');
          await this.context.tracing.stop({ path: `reports/traces/${name}.zip` });
        } else {
          await this.context.tracing.stop();
        }
        this.traceStarted = false;
      }
    } finally {
      try {
        await this.context?.close();
      } finally {
        await this.api?.dispose();
      }
    }
  }
});

AfterAll(async function () {
  try {
    await browser?.close();
  } finally {
    if (server && server.exitCode === null) {
      server.kill();
    }
  }
});