using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace studenticrud.Models;

public class studentiModel
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string? Id { get; set; }

    public string? ime { get; set; } = string.Empty;

    public string? prezime { get; set; } = string.Empty;

    public string? brojindeksa { get; set; } = string.Empty;

    public bool IsCompleted { get; set; } = false;
}
