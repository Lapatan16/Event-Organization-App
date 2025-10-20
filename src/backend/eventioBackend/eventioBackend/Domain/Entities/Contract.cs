using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace eventioBackend.Domain.Entities
{
    public class Contract
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("eventId"), BsonRepresentation(BsonType.ObjectId)]
        public string? EventId { get; set; }

        [BsonElement("resourceId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ResourceId { get; set; }

        [BsonElement("supplierId"), BsonRepresentation(BsonType.ObjectId)]
        public string? SupplierId { get; set; }

        [BsonElement("productId"), BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }

        [BsonElement("quantity")]
        public double? Quantity { get; set; }

        [BsonElement("status")]
        public string? Status { get; set; }
    }
}
