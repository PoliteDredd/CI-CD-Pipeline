
import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import type { APIRequestContext, BrowserContext, Page } from 'playwright';

export class DataBundleWorld extends World {
  context!: BrowserContext;
  page!: Page;
  api!: APIRequestContext;

  accountId!: string;
  startingBalance!: string;
  previousPurchases!: number;

  apiResponse!: {
    status: number;
    body: any;
  };

  purchaseReference!: string;
  purchaseReferences: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);
  }
}
setWorldConstructor(DataBundleWorld);