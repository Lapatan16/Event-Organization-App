namespace Eventio.Domain.Entities
{
    public class Resource
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int Quantity { get; set; }
        public string SupplierId { get; set; }
        public string EventId { get; set; }
    }
}