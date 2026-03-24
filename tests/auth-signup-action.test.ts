import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

const createClientMock = vi.fn();
const accountUpsertMock = vi.fn();
const workspaceUpsertMock = vi.fn();
const savePracticeProfileMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    account: {
      upsert: accountUpsertMock,
    },
    workspace: {
      upsert: workspaceUpsertMock,
    },
  },
}));

vi.mock("@/lib/setup/profile", () => ({
  savePracticeProfile: savePracticeProfileMock,
}));

describe("signUp action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provisions account and workspace idempotently before redirecting", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user_12345678",
              email: "teste@example.com",
              user_metadata: {},
            },
          },
          error: null,
        }),
      },
    });

    accountUpsertMock.mockResolvedValue({ id: "user_12345678" });
    workspaceUpsertMock.mockResolvedValue({ id: "workspace_1" });

    const { signUp } = await import("@/app/(auth)/actions");
    const formData = new FormData();
    formData.set("email", "teste@example.com");
    formData.set("password", "secret123");
    formData.set("confirmPassword", "secret123");
    formData.set("displayName", "Dra. Ana");

    await expect(signUp(formData)).rejects.toThrow("REDIRECT:/mfa-setup");

    expect(accountUpsertMock).toHaveBeenCalledWith({
      where: { email: "teste@example.com" },
      update: { displayName: "Dra. Ana" },
      create: {
        id: "user_12345678",
        email: "teste@example.com",
        displayName: "Dra. Ana",
      },
      select: { id: true },
    });

    expect(workspaceUpsertMock).toHaveBeenCalledWith({
      where: { ownerAccountId: "user_12345678" },
      update: { displayName: "Consultório de Dra. Ana" },
      create: {
        ownerAccountId: "user_12345678",
        slug: "ws_user_123",
        displayName: "Consultório de Dra. Ana",
      },
      select: { id: true },
    });

    expect(savePracticeProfileMock).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      fullName: "Dra. Ana",
      crp: null,
    });
  });

  it("uses the submitted email when Supabase omits user.email", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user_abcdefgh",
              email: null,
              user_metadata: {},
            },
          },
          error: null,
        }),
      },
    });

    accountUpsertMock.mockResolvedValue({ id: "user_abcdefgh" });
    workspaceUpsertMock.mockResolvedValue({ id: "workspace_2" });

    const { signUp } = await import("@/app/(auth)/actions");
    const formData = new FormData();
    formData.set("email", "fallback@example.com");
    formData.set("password", "secret123");
    formData.set("confirmPassword", "secret123");
    formData.set("displayName", "");

    await expect(signUp(formData)).rejects.toThrow("REDIRECT:/mfa-setup");

    expect(accountUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "fallback@example.com" },
        update: { displayName: "fallback@example.com" },
        create: expect.objectContaining({
          email: "fallback@example.com",
          displayName: "fallback@example.com",
        }),
      }),
    );
  });
});
