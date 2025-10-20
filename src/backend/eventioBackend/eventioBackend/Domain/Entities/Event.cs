using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace eventioBackend.Domain.Entities
{
    public class Event
    {
        [BsonId]
        [BsonElement("_id"), BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("organizerId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? OrganizerId { get; set; }

        [BsonElement("title")]
        public string? Title { get; set; }

        [BsonElement("description")]
        public string? Description { get; set; }

        [BsonElement("type")]
        public string? Type { get; set; } // concert | tournament | fair | workshop

        [BsonElement("contact")]
        public string? Contact { get; set; }

        [BsonElement("visibility")]
        public string? Visibility { get; set; }

        [BsonElement("poster")]
        public string? Poster { get; set; }

        [BsonElement("startDate")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime StartDate { get; set; }

        [BsonElement("endDate")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime EndDate { get; set; }

        [BsonElement("startTime")]
        public string? StartTime { get; set; }

        [BsonElement("program")]
        public List<EventProgram>? Programs { get; set; }

        [BsonElement("location")]
        public Location? Location { get; set; }

        [BsonElement("resources")]
        public List<Resource>? Resources { get; set; }

        [BsonElement("tickets")]
        public List<EventTicket>? Tickets { get; set; }

        [BsonElement("createdAt")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? CreatedAt { get; set; }

        [BsonElement("updatedAt")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? UpdatedAt { get; set; }

        [BsonElement("status")]
        public string? Status { get; set; } // draft | published | archived
    }

    public class EventProgram
    {
        [BsonElement("id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("date")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? Date { get; set; }

        [BsonElement("startTime")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? StartTime { get; set; }

        [BsonElement("endTime")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? EndTime { get; set; }

        //[BsonElement("location")]
        //public object? Location { get; set; }

        [BsonElement("description")]
        public string? Description { get; set; }
    }

    public class Location
    {
        [BsonElement("address")]
        public string? Address { get; set; }

        [BsonElement("lat")]
        public double? Lat { get; set; }

        [BsonElement("lng")]
        public double? Lng { get; set; }

        [BsonElement("city")]
        public string? City { get; set; }
    }

    public class Resource
    {
        [BsonElement("id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("type")]
        public string? Type { get; set; } // space | equipment | food | support

        [BsonElement("quantity")]
        public int Quantity { get; set; }

        [BsonElement("unit")]
        public string? Unit { get; set; }

        [BsonElement("public")]
        public bool? IsPublic { get; set; }

        [BsonElement("reserved")]
        public int? Reserved { get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }
    }

    public class EventTicket
    {
        [BsonElement("id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("price")]
        public double? Price { get; set; }

        [BsonElement("quantity")]
        public int? Quantity { get; set; }

        [BsonElement("sold")]
        public int? Sold { get; set; }

        [BsonElement("date")]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? Date { get; set; }
    }
}
