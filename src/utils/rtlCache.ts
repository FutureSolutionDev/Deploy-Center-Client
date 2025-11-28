/**
 * RTL Cache Configuration
 * Provides emotion cache with RTL plugin support for Material-UI
 */

import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

// Create RTL cache
export const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

// Create LTR cache (default)
export const cacheLtr = createCache({
  key: 'muiltr',
});
