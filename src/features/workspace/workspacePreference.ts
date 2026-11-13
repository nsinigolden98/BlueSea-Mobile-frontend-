/**
 * WORKSPACE PREFERENCE ADAPTER
 *
 * The preferred workspace lives in the user's profile row (the
 * `workspace` column on `user_preference_updateusermodel`), so it follows
 * the user across devices. localStorage is kept as an offline cache only:
 * it lets the shell paint the right home before the API answers, and it is
 * overwritten from the server on every read.
 *
 * Do not store credentials, tokens, PINs, or sensitive profile data here.
 */
import { getRequest, patchRequest } from '@/types';
import { ENDPOINTS } from '@/types';

export type WorkspaceId = 'personal' | 'affiliate' | 'marketplace' | 'payroll' | 'vault';

const STORAGE_KEY = 'bluesea_primary_workspace_v1';
const VALID_WORKSPACES: WorkspaceId[] = [
  'personal', 'affiliate', 'marketplace', 'payroll', 'vault',
];

function isWorkspace(value: unknown): value is WorkspaceId {
  return typeof value === 'string' && VALID_WORKSPACES.includes(value as WorkspaceId);
}

function readCache(): WorkspaceId {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isWorkspace(value) ? value : 'personal';
  } catch {
    return 'personal';
  }
}

function writeCache(workspace: WorkspaceId): void {
  try {
    localStorage.setItem(STORAGE_KEY, workspace);
  } catch {
    // A full or blocked storage is not a reason to fail the preference.
  }
}

/**
 * The user's preferred workspace, read from the profile.
 * Falls back to the cached value (and then to the dashboard) when the API
 * is unreachable.
 */
export async function getPreferredWorkspace(): Promise<WorkspaceId> {
  try {
    const profile = await getRequest(ENDPOINTS.user);
    const workspace = (profile as { workspace?: unknown } | undefined)?.workspace;
    if (isWorkspace(workspace)) {
      writeCache(workspace);
      return workspace;
    }
    // An older backend that does not send the field yet.
    return readCache();
  } catch {
    return readCache();
  }
}

/**
 * Store the preferred workspace on the profile (it persists server side).
 * The cache is updated first so the UI reacts immediately; a failed
 * request still leaves the cache in sync for the next read.
 */
export async function savePreferredWorkspace(workspace: WorkspaceId): Promise<void> {
  if (!VALID_WORKSPACES.includes(workspace)) {
    throw new Error('Invalid workspace preference');
  }
  writeCache(workspace);
  await patchRequest(ENDPOINTS.user, { workspace });
}

export const WORKSPACE_HOME: Record<WorkspaceId, string> = {
  personal: '/dashboard',
  affiliate: '/workspace/affiliate',
  marketplace: '/workspace/marketplace',
  payroll: '/workspace/payroll',
  vault: '/workspace/vault',
};
