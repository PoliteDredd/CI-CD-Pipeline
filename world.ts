import type { Browser, Page } from 'playwright';

export const world = {
  browser: null as Browser | null,
  page: null as Page | null,
};

export function setBrowserContext(nextBrowser: Browser, nextPage: Page) {
  world.browser = nextBrowser;
  world.page = nextPage;
}

export async function closeBrowser() {
  if (world.browser) {
    await world.browser.close();
    world.browser = null;
    world.page = null;
  }
}

export default world;
