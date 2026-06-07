import apiClient from './client';
import type { Property, PropertyFilters, SearchResult } from '@/types';

export const propertyApi = {
  getAll: async (filters: PropertyFilters): Promise<SearchResult> => {
    const { data } = await apiClient.get('/properties', { params: filters });
    return data.data;
  },

  getFeatured: async (): Promise<Property[]> => {
    const { data } = await apiClient.get('/properties/featured');
    return data.data;
  },

  getById: async (id: string): Promise<Property> => {
    const { data } = await apiClient.get(`/properties/${id}`);
    return data.data;
  },

  search: async (filters: PropertyFilters): Promise<SearchResult> => {
    const { data } = await apiClient.post('/properties/search', filters);
    return data.data;
  },

  create: async (propertyData: FormData): Promise<Property> => {
    const { data } = await apiClient.post('/properties', propertyData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (id: string, propertyData: Partial<Property>): Promise<Property> => {
    const { data } = await apiClient.put(`/properties/${id}`, propertyData);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },

  toggleSave: async (id: string): Promise<void> => {
    await apiClient.post(`/properties/${id}/save`);
  },

  getSaved: async (): Promise<Property[]> => {
    const { data } = await apiClient.get('/properties/saved');
    return data.data;
  },

  getMyListings: async (): Promise<Property[]> => {
    const { data } = await apiClient.get('/properties/my-listings');
    return data.data;
  },

  verify: async (id: string): Promise<Property> => {
    const { data } = await apiClient.post(`/properties/${id}/verify`);
    return data.data;
  },

  getAIInsights: async (id: string): Promise<{ insights: string; recommendations: string[] }> => {
    const { data } = await apiClient.get(`/properties/${id}/ai-insights`);
    return data.data;
  },

  matchProperties: async (query: string): Promise<Property[]> => {
    const { data } = await apiClient.post('/properties/ai-match', { query });
    return data.data;
  },
};
