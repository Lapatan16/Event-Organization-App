using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using eventioBackend.Domain.Entities;

namespace eventioBackend.Models
{
    public class TicketDTO
    {
        public string? Id { get; set; }
        public string? UserId { get; set; }
        public string? EventId { get; set; }
        public string? Name { get; set; }
        public double? Price { get; set; }
        public int? Quantity { get; set; }
        public DateTime? Date { get; set; }
        public string? QRCode { get; set; }
        public bool? IsScanned { get; set; }
        public List<Usluge>? Services { get; set; }
    }
}
