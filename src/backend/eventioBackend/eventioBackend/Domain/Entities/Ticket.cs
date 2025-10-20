using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;


namespace eventioBackend.Domain.Entities
{
    public class Ticket
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
        public string? UserId { get; set; }

        [BsonElement("eventId"), BsonRepresentation(BsonType.ObjectId)]
        public string? EventId { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }

        [BsonElement("quantity")]
        public int? Quantity { get; set; }

        [BsonElement("date")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? Date { get; set; }

        [BsonElement("QRCode")]
        public string? QRCode { get; set; }

        [BsonElement("isScanned")]
        public bool IsScanned { get; set; } = false;

        [BsonElement("services")]
        public List<Usluge>? Services { get; set; }
    }

    public class Usluge
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("quantity")]
        public int? Quantity { get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }
    }
}
