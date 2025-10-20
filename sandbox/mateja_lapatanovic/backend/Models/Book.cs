using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class Book
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("title"), BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public string? Title { get; set; }

        [BsonElement("author"), BsonRepresentation(MongoDB.Bson.BsonType.String)]
        public string? Author { get; set; }

        [BsonElement("year"), BsonRepresentation(MongoDB.Bson.BsonType.Int32)]
        public int? Year { get; set; }
    }
}
