import { api } from '../lib/api';

export type GenerateInviteCodeParams = {
  expiresInMinutes?: number;
};

export type InviteCodeResponse = {
  code: string;
};

export async function generateInviteCode (params?: GenerateInviteCodeParams): Promise<InviteCodeResponse> {
  const response = await api.post<InviteCodeResponse>('/invite-codes', params);
  return response.data;
};