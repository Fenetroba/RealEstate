import apiClient from './client';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface KycDocumentInfo {
  id: string;
  kind: 'ID_FRONT' | 'ID_BACK' | 'SELFIE';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface KycSubmissionStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  documents: KycDocumentInfo[];
}

export interface AdminKycSubmission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  documents: KycDocumentInfo[];
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN';
  phone: string | null;
  location: string | null;
  walletAddress: string | null;
  isVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  latestKyc: KycSubmissionStatus | null;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data;
  },

  register: async (userData: RegisterData): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post('/auth/refresh');
    return data.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const { data: response } = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  connectWallet: async (walletAddress: string): Promise<User> => {
    const { data } = await apiClient.post('/auth/connect-wallet', { walletAddress });
    return data.data;
  },

  // ── KYC ────────────────────────────────────────────────────────────────────

  submitKyc: async (files: {
    id_front: File;
    id_back: File;
    selfie: File;
  }): Promise<{ submissionId: string; status: string; message: string }> => {
    const form = new FormData();
    form.append('id_front', files.id_front);
    form.append('id_back',  files.id_back);
    form.append('selfie',   files.selfie);
    const { data } = await apiClient.post('/kyc/submit', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  getKycStatus: async (): Promise<KycSubmissionStatus | null> => {
    const { data } = await apiClient.get('/kyc/status');
    return data.data;
  },

  // ── Admin ───────────────────────────────────────────────────────────────────

  adminListUsers: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get('/auth/admin/users');
    return data.data;
  },

  adminListKycSubmissions: async (status?: string): Promise<AdminKycSubmission[]> => {
    const params = status ? `?status=${status}` : '';
    const { data } = await apiClient.get(`/kyc/admin/submissions${params}`);
    return data.data;
  },

  adminApproveKyc: async (submissionId: string): Promise<void> => {
    await apiClient.post(`/kyc/admin/${submissionId}/approve`);
  },

  adminRejectKyc: async (submissionId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/kyc/admin/${submissionId}/reject`, { reason });
  },

  adminGetKycDocumentUrl: (documentId: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/kyc/admin/document/${documentId}`;
  },
};
