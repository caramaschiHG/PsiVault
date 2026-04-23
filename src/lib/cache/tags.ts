/**
 * Centralized cache tags and key builder for PsiVault.
 *
 * CRITICAL: workspaceId is mandatory in every cache key.
 * Omitting workspaceId risks cross-tenant data leakage.
 */

export const CACHE_TAGS = {
  practiceProfile: "practice-profile",
  expenseCategories: "expense-categories",
  expenses: "expenses",
  financeCharges: "finance-charges",
  appointments: "appointments",
  patients: "patients",
  reminders: "reminders",
  notifications: "notifications",
} as const;

/**
 * Builds a cache key prefix for unstable_cache.
 * Every key includes the domain and workspaceId to prevent cross-tenant leaks.
 */
export function buildCacheKey(
  domain: string,
  workspaceId: string,
  ...parts: string[]
): string[] {
  return [domain, workspaceId, ...parts];
}
