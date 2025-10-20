using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Attributes;

namespace eventioBackend.Domain.Entities
{
    public class Resources
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Adress { get; set; }
        public string City { get; set; }
        public string Contact { get; set; }
        public string Description { get; set; }
        public string SupplierId { get; set; }

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; }
        
       /*  public int Quantity { get; set; }

            public string EventId { get; set; }*/
    }
}