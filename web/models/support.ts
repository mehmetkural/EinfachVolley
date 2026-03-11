export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}
