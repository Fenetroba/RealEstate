import apiClient from './client';
import type { DAOProposal } from '@/types';

export const daoApi = {
  getAll: async (): Promise<DAOProposal[]> => {
    const { data } = await apiClient.get('/dao/proposals');
    return data.data;
  },

  getById: async (id: string): Promise<DAOProposal> => {
    const { data } = await apiClient.get(`/dao/proposals/${id}`);
    return data.data;
  },

  create: async (proposal: Partial<DAOProposal>): Promise<DAOProposal> => {
    const { data } = await apiClient.post('/dao/proposals', proposal);
    return data.data;
  },

  vote: async (proposalId: string, vote: 'FOR' | 'AGAINST' | 'ABSTAIN'): Promise<void> => {
    await apiClient.post(`/dao/proposals/${proposalId}/vote`, { vote });
  },
};
