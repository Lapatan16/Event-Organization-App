using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace eventioBackend.Domain.Entities
{
    public class Supplier
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("supplierId"), BsonRepresentation(BsonType.ObjectId)]
        public string? SupplierId { get; set; }

        [BsonElement("type")]
        public string? Type { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("poster")]
        public string? Poster { get; set; }

        [BsonElement("contact")]
        public string? Contact { get; set; }

        [BsonElement("description")]
        public string? Description { get; set; }

        [BsonElement("products")]
        public List<Product>? Products { get; set; }
    }

    public class Product
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("amount")]
        public double? Amount { get; set; }

        [BsonElement("unit")]
        public string? Unit {  get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }
    }
}
