using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace eventioBackend.Domain.Entities
{
    public class User
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email"), BsonRepresentation(BsonType.String)]
        public string? Email { get; set; }

        [BsonElement("password_hash"), BsonRepresentation(BsonType.String)]
        public string? PasswordHash { get; set; }

        [BsonElement("first_name"), BsonRepresentation(BsonType.String)]
        public string? FirstName { get; set; }

        [BsonElement("last_name"), BsonRepresentation(BsonType.String)]
        public string? LastName { get; set; }

        [BsonElement("role"), BsonRepresentation(BsonType.String)]
        public string? Role { get; set; }

        [BsonElement("phone"), BsonRepresentation(BsonType.String)]
        public string? Phone { get; set; }

        [BsonElement("refresh_token"), BsonRepresentation(BsonType.String)]
        public string? RefreshToken { get; set; }

        [BsonElement("refresh_token_expiry_time"), BsonRepresentation(BsonType.DateTime)]
        public DateTime? RefreshTokenExpiryTime { get; set; }

        [BsonElement("avatar"), BsonRepresentation(BsonType.String)]
        public string? Avatar { get; set; }
    }
}
