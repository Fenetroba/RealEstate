import apiClient from './client';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface SupportMessage {
  id:         string;
  ticketId:   string;
  body:       string;
  isAdmin:    boolean;
  senderName: string | null;
  createdAt:  string;
}

export interface SupportTicket {
  id:          string;
  userId:      string | null;
  guestEmail:  string | null;
  guestName:   string | null;
  subject:     string;
  status:      TicketStatus;
  priority:    TicketPriority;
  createdAt:   string;
  updatedAt:   string;
  messages:    SupportMessage[];
  _count?:     { messages: number };
}

const BASE = '/support';

export const supportApi = {
  // ── User / guest ────────────────────────────────────────────────────────────

  /** Create a new ticket (works unauthenticated — pass no auth header) */
  createTicket: async (payload: {
    subject: string;
    body: string;
    guestEmail?: string;
    guestName?: string;
  }): Promise<SupportTicket> => {
    const { data } = await apiClient.post(`${BASE}/tickets`, payload);
    return data.data as SupportTicket;
  },

  /** List tickets for the logged-in user */
  myTickets: async (): Promise<SupportTicket[]> => {
    const { data } = await apiClient.get(`${BASE}/tickets`);
    return (data.data ?? []) as SupportTicket[];
  },

  /** Get a single ticket with full thread */
  getTicket: async (id: string): Promise<SupportTicket> => {
    const { data } = await apiClient.get(`${BASE}/tickets/${id}`);
    return data.data as SupportTicket;
  },

  /** Add a message to a ticket */
  addMessage: async (ticketId: string, body: string): Promise<SupportMessage> => {
    const { data } = await apiClient.post(`${BASE}/tickets/${ticketId}/messages`, { body });
    return data.data as SupportMessage;
  },

  // ── Admin ────────────────────────────────────────────────────────────────────

  /** Admin: list all tickets, optionally filter by status */
  adminListTickets: async (status?: TicketStatus): Promise<SupportTicket[]> => {
    const params = status ? `?status=${status}` : '';
    const { data } = await apiClient.get(`${BASE}/tickets${params}`);
    return (data.data ?? []) as SupportTicket[];
  },

  /** Admin: update ticket status */
  updateStatus: async (id: string, status: TicketStatus): Promise<void> => {
    await apiClient.patch(`${BASE}/tickets/${id}/status`, { status });
  },

  /** Admin: count of open tickets (for badge) */
  unreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get(`${BASE}/unread-count`);
    return data.count as number;
  },
};
