namespace eventioBackend.Models
{
    public class OrganizerAnalyticsDto
    {
        public string OrganizerId { get; set; } = null!;
        public AnalyticsTotals Totals { get; set; } = new();
        public List<EventAnalyticsDto> Events { get; set; } = new();
        public List<SimpleItemStat> TopEventsByRevenue { get; set; } = new();
        public List<SimpleItemStat> TopEventsByTicketsSold { get; set; } = new();
        public List<SimpleItemStat> TopTickets { get; set; } = new();
        public List<SimpleItemStat> TopResources { get; set; } = new();
        public List<TimePoint> RevenueByMonth { get; set; } = new();
    }

    public class AnalyticsTotals
    {
        public double TotalTicketRevenue { get; set; }
        public double TotalResourceRevenue { get; set; }
        public double TotalRevenue => TotalTicketRevenue + TotalResourceRevenue;
        public long TotalTicketsSold { get; set; }
        public long TotalResourcesReserved { get; set; }
        public int EventCount { get; set; }
    }

    public class EventAnalyticsDto
    {
        public string EventId { get; set; } = null!;
        public string Title { get; set; } = null!;
        public double TicketRevenue { get; set; }
        public double ResourceRevenue { get; set; }
        public double TotalRevenue => TicketRevenue + ResourceRevenue;
        public long TicketsSold { get; set; }
        public long ResourcesReserved { get; set; }
        public DateTime StartDate { get; set; }
    }

    public class SimpleItemStat
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public double Value { get; set; } // e.g. revenue or count
    }

    public class TimePoint
    {
        public string Period { get; set; } = null!; // e.g. "2025-01"
        public double Value { get; set; }
    }
}
