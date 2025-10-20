using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace demo_project.Entities
{
    public class Users
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("name"), BsonRepresentation(BsonType.String)]
        public string? Name { get; set; }
        [BsonElement("email"), BsonRepresentation(BsonType.String)]
        public string? Email { get; set; }
        [BsonElement("role"), BsonRepresentation(BsonType.String)]
        public string? Role { get; set; }
    }
}
