// Flash wallet demo — Buy data bundle rules (Module 3 · Topic 3 activity).
// Money is handled in cents to avoid floating-point errors.
const BUNDLES = [
  { code: 'D500MB', name: '500MB', priceCents: 5500 },
  { code: 'D1GB', name: '1GB', priceCents: 9900 },
  { code: 'D2GB', name: '2GB', priceCents: 14900 },
  { code: 'D5GB', name: '5GB', priceCents: 29900 },
  { code: 'D10GB', name: '10GB', priceCents: 46900 },
];
const DAILY_LIMIT = 3;

function formatZar(cents) {
  return 'R' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function evaluatePurchase(balanceCents, purchasesToday, mobileNumber, bundleCode) {
  const fail = (message) => ({ result: 'error', message, balanceCents });
  if (!/^0[678]\d{8}$/.test(mobileNumber)) return fail('Enter a valid SA mobile number');
  const bundle = BUNDLES.find((b) => b.code === bundleCode);
  if (!bundle) return fail('Choose a data bundle');
  if (purchasesToday >= DAILY_LIMIT) return fail('You can buy up to 3 data bundles a day');
  if (bundle.priceCents > balanceCents) return fail('Not enough funds in your Flash wallet');
  return { result: 'success', message: `${bundle.name} data bundle purchased`, balanceCents: balanceCents - bundle.priceCents, bundle };
}

module.exports = { BUNDLES, formatZar, evaluatePurchase };
