import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DataBundleWorld } from '../../support/world';
import { createAccount, createEarlierPurchases, getBundleCode, getPurchases, purchaseThroughUi} from '../../support/api-helpers';

Given('I have R500.00 in my wallet', async function (this: DataBundleWorld) {
  const account = await createAccount(this.api, '500.00');
  this.accountId = account.accountId;

  await this.page.goto(`http://localhost:3003/data-bundle?account=${account.accountId}`);
  await expect(this.page.getByTestId('wallet-balance')).toHaveText('R500.00');
});

When('I purchase the {string} data bundle for {string}',async function (this: DataBundleWorld, bundle: string, mobileNumber: string) {
    await purchaseThroughUi(this, mobileNumber, bundle);
  }
);

Then('my data bundle purchase should be successful', async function (this: DataBundleWorld) {
  await expect(this.page.getByTestId('purchase-message')).toHaveText(
    /\d+(MB|GB) data bundle purchased/i
  );
});

Then('I should see the purchase reference', async function (this: DataBundleWorld) {
  await expect(this.page.getByTestId('purchase-reference')).toHaveText(/Reference: DB-/);
});

Then('my wallet balance should be R{int}.{int}', async function (this: DataBundleWorld, whole: number, fraction: number) {
    const expectedBalance = `${whole}.${fraction.toString().padStart(2, '0')}`;
    await expect(this.page.getByTestId('wallet-balance')).toHaveText(`R${expectedBalance}`);
  }
);

When('I purchase the following data bundles:', async function (this: DataBundleWorld, table: DataTable) {
    for (const purchase of table.hashes()) {
      await purchaseThroughUi(this, purchase.mobileNumber, purchase.bundle);
      await expect(this.page.getByTestId('purchase-message')).toHaveText(
        /\d+(MB|GB) data bundle purchased/i
      );
    }
  }
);

Then('both data bundle purchases should be successful', async function (this: DataBundleWorld) {
  const purchases = await getPurchases(this.api, this.accountId);
  expect(purchases).toHaveLength(2);
});

Then('each purchase should have a reference', async function (this: DataBundleWorld) {
  const purchases = await getPurchases(this.api, this.accountId);
  expect(purchases).toHaveLength(2);
  expect(purchases.every((purchase: { reference?: string }) => Boolean(purchase.reference))).toBe(true);
});

Then('both purchases should be recorded in the API', async function (this: DataBundleWorld) {
  const purchases = await getPurchases(this.api, this.accountId);
  expect(purchases).toHaveLength(2);
});

Then( 'the purchase should be recorded for {string} in the API', async function (this: DataBundleWorld, mobileNumber: string) {
    const purchases = await getPurchases(this.api, this.accountId);
    expect(
      purchases.some((purchase: { mobileNumber: string }) => purchase.mobileNumber === mobileNumber)
    ).toBe(true);
  }
);

Given( 'I have already purchased {int} data bundles today', async function (this: DataBundleWorld, count: number) {
    const bundleCode = await getBundleCode(this, '500MB');
    await createEarlierPurchases(this.api, this.accountId, count, '0821234567', bundleCode);
  }
);

When( 'I attempt to purchase the {string} data bundle for {string}', async function (this: DataBundleWorld, bundle: string, mobileNumber: string) {
    await purchaseThroughUi(this, mobileNumber, bundle);
  }
);

Then('my purchase should be rejected', async function (this: DataBundleWorld) {
  await expect(this.page.getByTestId('purchase-message')).toHaveText(
    'You can buy up to 3 data bundles a day'
  );
});

Then( 'I should be told {string}', async function (this: DataBundleWorld, message: string) {
    await expect(this.page.getByTestId('purchase-message')).toHaveText(message);
  }
);

Then('the API should reject the purchase', async function (this: DataBundleWorld) {
  const purchases = await getPurchases(this.api, this.accountId);
  expect(purchases).toHaveLength(3);
});

Then(
  'my wallet balance should remain R{int}.{int}',
  async function (this: DataBundleWorld, whole: number, fraction: number) {
    const expectedBalance = `${whole}.${fraction.toString().padStart(2, '0')}`;
    await expect(this.page.getByTestId('wallet-balance')).toHaveText(`R${expectedBalance}`);
  }
);
