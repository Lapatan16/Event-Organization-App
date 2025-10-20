export interface OrganizerAnalytics {
  organizerId: string;
  totals: AnalyticsTotals;
  events: EventAnalytics[];
  topEventsByRevenue: SimpleItemStat[];
  topEventsByTicketsSold: SimpleItemStat[];
  topTickets: SimpleItemStat[];
  topResources: SimpleItemStat[];
  revenueByMonth: TimePoint[];
}

export interface AnalyticsTotals {
  totalTicketRevenue: number;
  totalResourceRevenue: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalResourcesReserved: number;
  eventCount: number;
}

export interface EventAnalytics {
  eventId: string;
  title: string;
  ticketRevenue: number;
  resourceRevenue: number;
  totalRevenue: number;
  ticketsSold: number;
  resourcesReserved: number;
  startDate: string;
}

export interface SimpleItemStat {
  id: string;
  name: string;
  value: number;
}

export interface TimePoint {
  period: string;
  value: number;
}
