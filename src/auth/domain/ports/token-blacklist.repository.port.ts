export interface CreateTokenBlacklistData {
  token: string;
  expiresAt: Date;
}

export interface ITokenBlacklistRepository {
  add(data: CreateTokenBlacklistData): Promise<void>;
  exists(token: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
}
