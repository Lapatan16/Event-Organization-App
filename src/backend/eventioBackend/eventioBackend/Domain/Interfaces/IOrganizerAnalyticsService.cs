using eventioBackend.Models;

namespace eventioBackend.Domain.Interfaces
{
    public interface IOrganizerAnalyticsService
    {
        Task<OrganizerAnalyticsDto?> GetOrganizerAnalyticsAsync(
            string organizerId, DateTime? from = null, DateTime? to = null
        );
    }
}
