export interface WorkspaceSmtpConfig {
  id: string;
  workspaceId: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  passwordCiphertext: string;
  fromName: string;
  fromEmail: string;
  sendReminder24h: boolean;
  sendReminder1h: boolean;
  sendConfirmation: boolean;
  sendCancellation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmtpConfigRepository {
  save(config: WorkspaceSmtpConfig): Promise<WorkspaceSmtpConfig>;
  findByWorkspace(workspaceId: string): Promise<WorkspaceSmtpConfig | null>;
}

export function createInMemorySmtpConfigRepository(): SmtpConfigRepository {
  const store = new Map<string, WorkspaceSmtpConfig>();

  return {
    save(config) {
      store.set(config.workspaceId, config);
      return Promise.resolve(config);
    },
    findByWorkspace(workspaceId) {
      return Promise.resolve(store.get(workspaceId) ?? null);
    },
  };
}
