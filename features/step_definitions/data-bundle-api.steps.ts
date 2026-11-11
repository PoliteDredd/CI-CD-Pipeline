import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DataBundleWorld } from '../../support/world';
import { createEarlierPurchases, getBundleCode, prepareApiAccount, purchaseThroughApi, type PurchaseBody } from '../../support/api-helpers';

Given('I create an API wallet with R{int}.00', async function (this: DataBundleWorld, balance: number) {
    await prepareApiAccount(this, `${balance}.00`);
  }
);

Given('the API wallet has already purchased {int} data bundles today', async function (this: DataBundleWorld, count: number) {
    this.previousPurchases = count;

    if (count > 0) {
      const bundleCode = await getBundleCode(this, '500MB');
      await createEarlierPurchases(this.api, this.accountId, count, '0821234567', bundleCode);
    }
  }
);

When('I submit an API purchase for {string} to {string}', async function (this: DataBundleWorld, bundle: string, mobileNumber: string) {
    await purchaseThroughApi(this, mobileNumber, bundle);
  }
);

Then('the API purchase should be {string}', async function (this: DataBundleWorld, expectedResult: string) {
    const expectedStatus = expectedResult.toLowerCase() === 'accepted' ? 201 : 422;
    expect(this.apiResponse.status).toBe(expectedStatus);
  }
);

Then( 'the API should return the message {string}', async function (this: DataBundleWorld, expectedMessage: string) {
    const body = this.apiResponse.body as PurchaseBody;
    expect(body.message).toBe(expectedMessage);
  }
);
