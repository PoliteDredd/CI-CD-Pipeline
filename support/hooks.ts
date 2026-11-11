
import { BeforeAll, Before, After, AfterAll, Status } from '@cucumber/cucumber';
import type { ITestCaseHookParameter } from '@cucumber/cucumber';
import { chromium, request, type Browser } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { waitForServer } from './api-helpers';
import { DataBundleWorld } from './world';

const BASE_URL = 'http://localhost:3003';

let server: ChildProcess;
let browser: Browser;

BeforeAll(async function () {
  server = spawn('node', ['data-app/server.js'], {
    stdio: 'ignore'
  });

  await waitForServer(`${BASE_URL}/api/bundles`);

  browser = await chromium.launch({
    headless: true
  });
});

Before(async function (this: DataBundleWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  this.api = await request.newContext({
    baseURL: BASE_URL
  });

  this.purchaseReferences = [];
});

After(async function (
  this: DataBundleWorld,
  { result }: ITestCaseHookParameter
) {
  try {
    if (result?.status === Status.FAILED && this.page) {
      const screenshot = await this.page.screenshot({
        fullPage: true
      });

      this.attach(screenshot, 'image/png');
    }
  } finally {
    await this.context?.close();
    await this.api?.dispose();
  }
});

AfterAll(async function () {
  await browser?.close();

  if (server && server.exitCode === null) {
    server.kill();
  }
});