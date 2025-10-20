using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Server.Data.Entities
{
    public class Festival
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("naziv"), BsonRepresentation(BsonType.String)]
        public string? Naziv { get; set; }

        [BsonElement("lokacija"), BsonRepresentation(BsonType.String)]
        public string? Lokacija { get; set; }
    }
}
