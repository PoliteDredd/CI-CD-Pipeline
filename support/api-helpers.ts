import { expect, type APIRequestContext } from '@playwright/test';
import { DataBundleWorld } from './world';
const BASE_URL = 'http://localhost:3003';

//------------------------------------------------------------------------------------------------------------------------------
// WEB/UI HELPERS
export function getUiTestAccountId(): string {
  const accountId = process.env.UI_TEST_ACCOUNT_ID;

  if (!accountId) { throw new Error( 'Set UI_TEST_ACCOUNT_ID to a pre-created test account ID' );}
  return accountId;
}

export async function openDataBundlePage( world: DataBundleWorld ): Promise<void> {
  const accountId = getUiTestAccountId();
  world.accountId = accountId;
  await world.page.goto(`http://localhost:3003/data-bundle?account=${accountId}`);
  await expect(world.page.getByTestId('wallet-balance')).toBeVisible();
}

export async function purchaseThroughUi( world: DataBundleWorld, mobileNumber: string, bundleName: string): Promise<void> {
  await world.page.getByLabel(/mobile number/i).fill(mobileNumber);

  if (bundleName.trim() && bundleName !== '[empty]') {
    const bundleCode = await getBundleCode(world, bundleName);
    await world.page.getByLabel(/data bundle|bundle/i).selectOption(bundleCode);
  }
  await world.page.getByRole('button', { name: /buy data/i }).click();
}

//------------------------------------------------------------------------------------------------------------------------------
// API HELPERS 
// INTERFACES
export interface PurchaseBody {
  result: string;
  message: string;
  reference?: string;
  balance: string;
}

export interface AccountResponse {
  accountId: string;
  balance: string;
}

export interface Bundle {
  code: string;
  name: string;
  price: string;
}

export interface PurchaseResponse {
  result: string;
  message: string;
  reference?: string;
  balance: string;
}
//-----------------------------------------------------------
//FUNCTIONS
export async function createAccount( api: APIRequestContext, startingBalance = '500.00' ): Promise<AccountResponse> {
  const response = await api.post('/api/accounts', { data: { startingBalance }
  });

  if (response.status() !== 201) { throw new Error( `Account creation failed: ${response.status()} ` +
      await response.text()
    );
  }
  return await response.json() as AccountResponse;
}
//---------------------------------------------------------

export async function prepareApiAccount( world: DataBundleWorld, balance: string ): Promise<void> {
  const account = await createAccount(world.api, balance);

  world.accountId = account.accountId;
  world.startingBalance = account.balance;
  world.previousPurchases = 0;
  world.purchaseReferences = [];
}
//---------------------------------------------------------
export async function getAccount( api: APIRequestContext, accountId: string ): Promise<AccountResponse> {
  const response = await api.get( `/api/accounts/${accountId}`);

  if (response.status() !== 200) {
    throw new Error(`Failed to get account: ${response.status()} ` +
      await response.text()
    );
  }
  return await response.json() as AccountResponse;
}
//----------------------------------------------------------

export async function createEarlierPurchases( api: APIRequestContext, accountId: string, count: number, mobileNumber: string, bundleCode: string ): Promise<void> {
  for (let i = 0; i < count; i++) {
    const result = await buyBundle( api, accountId, mobileNumber, bundleCode );

    if (result.status !== 201) {
      throw new Error( `Setup purchase ${i + 1} failed: ` +
        `${result.status} ${JSON.stringify(result.body)}`
      );
    }
  }
}
//-------------------------------------------------

export async function buyBundle( api: APIRequestContext, accountId: string, mobileNumber: string, bundleCode: string) {
  const response = await api.post( `/api/accounts/${accountId}/bundles`, { data: { mobileNumber, bundleCode} }
  );
  return {
    status: response.status(),
    body: await response.json()
  };
}
//-------------------------------------------------

export async function purchaseThroughApi( world: DataBundleWorld, mobileNumber: string, bundleName: string): Promise<void> {
  const bundleCode = bundleName.trim() ? await getBundleCode(world, bundleName): '';
  const response = await buyBundle( world.api, world.accountId, mobileNumber, bundleCode);

  world.apiResponse = {
    status: response.status,
    body: response.body
  };

  const body = response.body as PurchaseBody;

  if (response.status === 201 && body.reference) {
    world.purchaseReference = body.reference;
    world.purchaseReferences.push(body.reference);
  }
}
//----------------------------------------------------------

export async function getBundles( api: APIRequestContext ): Promise<Bundle[]> {
  const response = await api.get('/api/bundles');

  if (response.status() !== 200) {
    throw new Error( `Failed to get bundles: ${response.status()} ` +
      await response.text()
    );
  }
  return await response.json() as Bundle[];
}
//----------------------------------------------------------

export async function getBundleCode( world: DataBundleWorld, bundleName: string ): Promise<string> {
  const bundles = await getBundles(world.api);
  const bundle = bundles.find( item => item.name.toLowerCase() === bundleName.toLowerCase() );

  if (!bundle) { throw new Error(`Bundle "${bundleName}" was not found`);}
  return bundle.code;
}
//----------------------------------------------------------

export async function getPurchases( api: APIRequestContext, accountId: string ) {
  const response = await api.get( `/api/accounts/${accountId}/purchases` );

  if (response.status() !== 200) {
    throw new Error( `Failed to get purchases: ${response.status()} ` +
      await response.text()
    );
  }
 return await response.json();
}
//-----------------------------------------------------------------------------------------------------------------

export async function waitForServer( url: string ): Promise<void> {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // The server may still be starting.
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Server did not become ready at ${url}`);
}
//-------------------------------------------------------------------------------------------------------------
