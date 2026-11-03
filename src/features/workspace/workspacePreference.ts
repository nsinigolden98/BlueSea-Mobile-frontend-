/**
 * WORKSPACE PREFERENCE ADAPTER
 * LOCAL TEST MODE: this file reads/writes the preferred workspace in localStorage.
 * BACKEND INTEGRATION: replace only getPreferredWorkspace() and
 * savePreferredWorkspace() with authenticated backend calls when the API contract
 * is available. Do not store credentials, tokens, PINs, or sensitive profile data here.
 */
export type WorkspaceId = 'personal' | 'affiliate' | 'marketplace' | 'payroll' | 'vault';

const STORAGE_KEY = 'bluesea_primary_workspace_v1';
const VALID_WORKSPACES: WorkspaceId[] = [
  'personal', 'affiliate', 'marketplace', 'payroll', 'vault',
];

export async function getPreferredWorkspace(): Promise<WorkspaceId> {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return VALID_WORKSPACES.includes(value as WorkspaceId)
      ? (value as WorkspaceId)
      : 'personal';
  } catch {
    return 'personal';
  }
}

export async function savePreferredWorkspace(workspace: WorkspaceId): Promise<void> {
  if (!VALID_WORKSPACES.includes(workspace)) {
    throw new Error('Invalid workspace preference');
  }
  try {
    localStorage.setItem(STORAGE_KEY, workspace);
  } catch {
    throw new Error('Unable to save workspace preference on this device');
  }
}

export const WORKSPACE_HOME: Record<WorkspaceId, string> = {
  personal: '/dashboard',
  affiliate: '/workspace/affiliate',
  marketplace: '/workspace/marketplace',
  payroll: '/workspace/payroll',
  vault: '/workspace/vault',
};
