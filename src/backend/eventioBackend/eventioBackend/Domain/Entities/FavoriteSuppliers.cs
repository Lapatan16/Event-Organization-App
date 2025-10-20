using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace eventioBackend.Domain.Entities
{
    public class FavoriteSuppliers
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("organizerId"), BsonRepresentation(BsonType.ObjectId)]
        public string? OrganizerId { get; set; }

        [BsonElement("supplierId"), BsonRepresentation(BsonType.ObjectId)]
        public string? SupplierId { get; set; }
    }
}
