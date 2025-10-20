using eventioBackend.Domain.Entities;

namespace eventioBackend.Models
{
    public class EventDTO
    {
        public string? Id { get; set; }
        public string? OrganizerId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public string? Contact { get; set; }
        public string? Visibility { get; set; }
        public string? Poster { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? StartTime { get; set; }
        public List<EventProgram>? Programs { get; set; }
        public Location? Location { get; set; }
        public List<Resource>? Resources { get; set; }
        public List<EventTicket>? Tickets { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Status { get; set; }

    }
}
