/**
 * Workspace icon catalog — mirror of server/src/Types/IWorkspaceIcons.ts.
 * Drift between the two breaks the parity test in
 * server/__tests__/unit/Types/WorkspaceIconsParity.test.ts.
 *
 * Each key maps to a MUI Icons component name. The picker renders one
 * Avatar/Icon per key.
 */

import type {
  SvgIconComponent,
} from '@mui/icons-material';
import Folder from '@mui/icons-material/Folder';
import Rocket from '@mui/icons-material/RocketLaunch';
import Cloud from '@mui/icons-material/Cloud';
import Web from '@mui/icons-material/Public';
import Mobile from '@mui/icons-material/PhoneIphone';
import Database from '@mui/icons-material/Storage';
import Terminal from '@mui/icons-material/Terminal';
import Api from '@mui/icons-material/Api';
import StaticSite from '@mui/icons-material/Description';
import Cms from '@mui/icons-material/Article';
import Commerce from '@mui/icons-material/ShoppingCart';
import Auth from '@mui/icons-material/Lock';
import Analytics from '@mui/icons-material/Insights';
import Payments from '@mui/icons-material/Payment';
import Messaging from '@mui/icons-material/Chat';
import Monitoring from '@mui/icons-material/MonitorHeart';
import Storage from '@mui/icons-material/Inventory2';
import Cdn from '@mui/icons-material/Dns';
import Search from '@mui/icons-material/Search';
import Default from '@mui/icons-material/Apps';

export const WORKSPACE_ICON_KEYS = [
  'folder',
  'rocket',
  'cloud',
  'web',
  'mobile',
  'database',
  'terminal',
  'api',
  'staticSite',
  'cms',
  'commerce',
  'auth',
  'analytics',
  'payments',
  'messaging',
  'monitoring',
  'storage',
  'cdn',
  'search',
  'default',
] as const;

export type TWorkspaceIcon = (typeof WORKSPACE_ICON_KEYS)[number];

export const DEFAULT_WORKSPACE_ICON: TWorkspaceIcon = 'folder';

export const WORKSPACE_ICON_COMPONENTS: Record<TWorkspaceIcon, SvgIconComponent> = {
  folder: Folder,
  rocket: Rocket,
  cloud: Cloud,
  web: Web,
  mobile: Mobile,
  database: Database,
  terminal: Terminal,
  api: Api,
  staticSite: StaticSite,
  cms: Cms,
  commerce: Commerce,
  auth: Auth,
  analytics: Analytics,
  payments: Payments,
  messaging: Messaging,
  monitoring: Monitoring,
  storage: Storage,
  cdn: Cdn,
  search: Search,
  default: Default,
};

export const WORKSPACE_ICON_LABELS: Record<TWorkspaceIcon, string> = {
  folder: 'Folder',
  rocket: 'Rocket',
  cloud: 'Cloud',
  web: 'Web',
  mobile: 'Mobile',
  database: 'Database',
  terminal: 'Terminal',
  api: 'API',
  staticSite: 'Static site',
  cms: 'CMS',
  commerce: 'Commerce',
  auth: 'Auth',
  analytics: 'Analytics',
  payments: 'Payments',
  messaging: 'Messaging',
  monitoring: 'Monitoring',
  storage: 'Storage',
  cdn: 'CDN',
  search: 'Search',
  default: 'Default',
};
