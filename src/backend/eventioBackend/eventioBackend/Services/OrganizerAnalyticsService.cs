using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace eventioBackend.Services
{
    public class OrganizerAnalyticsService : IOrganizerAnalyticsService
    {
        private readonly IMongoCollection<Event> _eventsCollection;

        public OrganizerAnalyticsService(MongoDbService mongoDbService)
        {
            _eventsCollection = mongoDbService.Database.GetCollection<Event>("events");
        }

        public async Task<OrganizerAnalyticsDto?> GetOrganizerAnalyticsAsync(string organizerId, DateTime? from = null, DateTime? to = null)
        {
            // Build filter for organizer + optional date range
            var filterBuilder = Builders<Event>.Filter;
            var filter = filterBuilder.Eq(e => e.OrganizerId, organizerId);

            if (from.HasValue)
                filter &= filterBuilder.Gte(e => e.StartDate, from.Value);
            if (to.HasValue)
                filter &= filterBuilder.Lte(e => e.StartDate, to.Value);

            // Fetch all relevant events (no need for all fields, only tickets/resources)
            var eventsList = await _eventsCollection.Find(filter).ToListAsync();

            if (eventsList == null || !eventsList.Any())
            {
                return new OrganizerAnalyticsDto
                {
                    OrganizerId = organizerId
                };
            }

            // Prepare DTOs and totals
            var eventsDto = new List<EventAnalyticsDto>();
            double totalTicketRevenue = 0;
            double totalResourceRevenue = 0;
            long totalTicketsSold = 0;
            long totalResourcesReserved = 0;

            foreach (var ev in eventsList)
            {
                var ticketRevenue = ev.Tickets?.Sum(t => (t.Sold ?? 0) * (t.Price ?? 0)) ?? 0;
                var ticketsSold = ev.Tickets?.Sum(t => t.Sold ?? 0) ?? 0;

                var resourceRevenue = ev.Resources?.Sum(r => (r.Reserved ?? 0) * (r.Price ?? 0)) ?? 0;
                var resourcesReserved = ev.Resources?.Sum(r => r.Reserved ?? 0) ?? 0;

                totalTicketRevenue += ticketRevenue;
                totalResourceRevenue += resourceRevenue;
                totalTicketsSold += ticketsSold;
                totalResourcesReserved += resourcesReserved;

                eventsDto.Add(new EventAnalyticsDto
                {
                    EventId = ev.Id!,
                    Title = ev.Title ?? "Untitled",
                    StartDate = ev.StartDate,
                    TicketRevenue = ticketRevenue,
                    ResourceRevenue = resourceRevenue,
                    TicketsSold = ticketsSold,
                    ResourcesReserved = resourcesReserved
                });
            }

            // Top 5 events by revenue
            var topEventsByRevenue = eventsDto
                .OrderByDescending(e => e.TotalRevenue)
                .Take(5)
                .Select(e => new SimpleItemStat { Id = e.EventId, Name = e.Title, Value = Math.Round(e.TotalRevenue, 2) })
                .ToList();

            // Top 5 events by tickets sold
            var topEventsByTicketsSold = eventsDto
                .OrderByDescending(e => e.TicketsSold)
                .Take(5)
                .Select(e => new SimpleItemStat { Id = e.EventId, Name = e.Title, Value = e.TicketsSold })
                .ToList();

            // Top tickets (aggregate across all events)
            var allTickets = eventsList
                .SelectMany(e => e.Tickets ?? new List<EventTicket>())
                .GroupBy(t => new { t.Id, t.Name })
                .Select(g => new SimpleItemStat
                {
                    Id = g.Key.Id!,
                    Name = g.Key.Name ?? "Untitled",
                    Value = g.Sum(t => t.Sold ?? 0)
                })
                .OrderByDescending(t => t.Value)
                .Take(10)
                .ToList();

            // Top resources (aggregate across all events)
            var allResources = eventsList
                .SelectMany(e => e.Resources ?? new List<Resource>())
                .GroupBy(r => new { r.Id, r.Name })
                .Select(g => new SimpleItemStat
                {
                    Id = g.Key.Id!,
                    Name = g.Key.Name ?? "Untitled",
                    Value = g.Sum(r => r.Reserved ?? 0)
                })
                .OrderByDescending(r => r.Value)
                .Take(10)
                .ToList();

            // Revenue by month (ticket + resource)
            var revenueByMonth = eventsList
                .GroupBy(e => new DateTime(e.StartDate.Year, e.StartDate.Month, 1))
                .OrderBy(g => g.Key)
                .Select(g =>
                {
                    var monthTicketRevenue = g.Sum(ev => ev.Tickets?.Sum(t => (t.Sold ?? 0) * (t.Price ?? 0)) ?? 0);
                    var monthResourceRevenue = g.Sum(ev => ev.Resources?.Sum(r => (r.Reserved ?? 0) * (r.Price ?? 0)) ?? 0);
                    return new TimePoint
                    {
                        Period = g.Key.ToString("yyyy-MM"),
                        Value = Math.Round(monthTicketRevenue + monthResourceRevenue, 2)
                    };
                })
                .ToList();

            // Build final DTO
            var dto = new OrganizerAnalyticsDto
            {
                OrganizerId = organizerId,
                Totals = new AnalyticsTotals
                {
                    TotalTicketRevenue = Math.Round(totalTicketRevenue, 2),
                    TotalResourceRevenue = Math.Round(totalResourceRevenue, 2),
                    TotalTicketsSold = totalTicketsSold,
                    TotalResourcesReserved = totalResourcesReserved,
                    EventCount = eventsDto.Count
                    // TotalRevenue is computed automatically
                },
                Events = eventsDto.OrderByDescending(e => e.TotalRevenue).ToList(),
                TopEventsByRevenue = topEventsByRevenue,
                TopEventsByTicketsSold = topEventsByTicketsSold,
                TopTickets = allTickets,
                TopResources = allResources,
                RevenueByMonth = revenueByMonth
            };

            return dto;
        }
    }
}
