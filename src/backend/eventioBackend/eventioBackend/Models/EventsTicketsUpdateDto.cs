using eventioBackend.Domain.Entities;

namespace eventioBackend.Models
{
    public class EventsTicketsUpdateDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } 
        public double Price { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public int Sold { get; set; }
    }
}