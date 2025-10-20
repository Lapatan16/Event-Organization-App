using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.Models;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;

namespace eventioBackend.Services
{
    public class EventService : IEventService
    {
        private readonly IMongoCollection<Event> _events;

        public EventService(MongoDbService mongoDbService)
        {
            _events = mongoDbService.Database.GetCollection<Event>("events");
        }

        public async Task<PagedResult<EventDTO>> GetAllEventsAsync(int pageNumber, int pageSize)
        {
            await ExpirePastEventsAsync();

            var totalCount = await _events.CountDocumentsAsync(_ => true);

            var events = await _events.Find(_ => true)
                                      .Skip((pageNumber - 1) * pageSize)
                                      .Limit(pageSize)
                                      .ToListAsync();

            var dtos = events.Select(ToEventDto).ToList();

            return new PagedResult<EventDTO>
            {
                Items = dtos,
                TotalItems = (int)totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<EventDTO>> GetAllEventsByCategoryAsync(int pageNumber, int pageSize, string category)
        {
            await ExpirePastEventsAsync();

            FilterDefinition<Event> filter = Builders<Event>.Filter.Empty;

            if (!string.IsNullOrEmpty(category) && category.ToLower() != "all")
            {
                switch (category.ToLower())
                {
                    case "draft":
                        filter = Builders<Event>.Filter.Eq(e => e.Status, "draft");
                        break;

                    case "published":
                        filter = Builders<Event>.Filter.Eq(e => e.Status, "published");
                        break;

                    case "expired":
                        filter = Builders<Event>.Filter.Eq(e => e.Status, "expired");
                        break;
                }
            }

            var totalCount = await _events.CountDocumentsAsync(filter);

            var events = await _events.Find(filter)
                                      .Skip((pageNumber - 1) * pageSize)
                                      .Limit(pageSize)
                                      .ToListAsync();

            var dtos = events.Select(ToEventDto).ToList();

            return new PagedResult<EventDTO>
            {
                Items = dtos,
                TotalItems = (int)totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }


        public async Task<PagedResult<PublicEventDTO>> GetAllPublicEventsAsync(int pageNumber, int pageSize)
        {
            await ExpirePastEventsAsync();

            var publishedFilter = Builders<Event>.Filter.Eq(e => e.Status, "published");

            var totalCount = await _events.CountDocumentsAsync(publishedFilter);

            var events = await _events.Find(publishedFilter)
                                      .Skip((pageNumber - 1) * pageSize)
                                      .Limit(pageSize)
                                      .ToListAsync();

            var dtos = events.Select(e => new PublicEventDTO
            {
                Id = e.Id,
                OrganizerId = e.OrganizerId,
                Title = e.Title,
                Description = e.Description,
                Type = e.Type,
                Contact = e.Contact,
                Visibility = e.Visibility,
                Poster = e.Poster,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                StartTime = e.StartTime,
                Program = e.Programs,
                Location = e.Location,
                Tickets = e.Tickets
            }).ToList();

            return new PagedResult<PublicEventDTO>
            {
                Items = dtos,
                TotalItems = (int)totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        private async Task ExpirePastEventsAsync()
        {
            var now = DateTime.UtcNow;

            var expireFilter = Builders<Event>.Filter.Eq(e => e.Status, "published") &
                               Builders<Event>.Filter.Lt(e => e.EndDate, now);

            var expireUpdate = Builders<Event>.Update.Set(e => e.Status, "expired");

            await _events.UpdateManyAsync(expireFilter, expireUpdate);
        }

        public async Task<IEnumerable<PublicEventDTO>> GetPublicEventsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (endDate < startDate)
                throw new ArgumentException("endDate must be greater than or equal to startDate");

            var filter = Builders<Event>.Filter.And(
                Builders<Event>.Filter.Gte(e => e.StartDate, startDate),
                Builders<Event>.Filter.Lte(e => e.EndDate, endDate)
            );

            var events = await _events.Find(filter)
                .SortBy(e => e.StartDate)
                .ToListAsync();

            return events.Select(e => new PublicEventDTO
            {
                Id = e.Id,
                OrganizerId = e.OrganizerId,
                Title = e.Title,
                Description = e.Description,
                Type = e.Type,
                Contact = e.Contact,
                Visibility = e.Visibility,
                Poster = e.Poster,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                StartTime = e.StartTime,
                Program = e.Programs,
                Location = e.Location,
                Tickets = e.Tickets
            }).ToList();
        }



        public async Task<EventDTO?> GetEventByIdAsync(string id)
        {
            var ev = await _events.Find(e => e.Id == id).FirstOrDefaultAsync();
            return ev == null ? null : ToEventDto(ev);
        }

        public async Task<PublicEventDTO?> GetPublicEventByIdAsync(string id)
        {
            var e = await _events.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (e == null) return null;

            return new PublicEventDTO
            {
                Id = e.Id,
                OrganizerId = e.OrganizerId,
                Title = e.Title,
                Description = e.Description,
                Type = e.Type,
                Contact = e.Contact,
                Visibility = e.Visibility,
                Poster = e.Poster,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                StartTime = e.StartTime,
                Program = e.Programs,
                Location = e.Location,
                Tickets = e.Tickets
            };
        }

        public async Task<EventTitleDTO?> GetEventTitleAsync(string id)
        {
            var e = await _events.Find(x => x.Id == id).FirstOrDefaultAsync();
            return e == null ? null : new EventTitleDTO { Id = e.Id, Title = e.Title };
        }

        public async Task<PagedResult<EventDTO>> GetEventsByOrganizerIdAsync(string organizerId, int pageNumber, int pageSize)
        {
            var filter = Builders<Event>.Filter.Eq(e => e.OrganizerId, organizerId);
            var totalCount = await _events.CountDocumentsAsync(filter);

            var events = await _events.Find(filter)
                                      .Skip((pageNumber - 1) * pageSize)
                                      .Limit(pageSize)
                                      .ToListAsync();

            var dtos = events.Select(ToEventDto).ToList();

            return new PagedResult<EventDTO>
            {
                Items = dtos,
                TotalItems = (int)totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Event> CreateEventAsync(Event newEvent)
        {
            if (newEvent.Tickets != null)
                foreach (var ticket in newEvent.Tickets)
                    ticket.Id = ObjectId.GenerateNewId().ToString();

            await _events.InsertOneAsync(newEvent);
            return newEvent;
        }

        public async Task<bool> IncrementResourceReservedAsync(string eventId, string resourceId, int quantity)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null || ev.Resources == null) return false;

            var resource = ev.Resources.FirstOrDefault(r => r.Id == resourceId);
            if (resource == null) return false;

            resource.Reserved = (resource.Reserved ?? 0) + quantity;

            var update = Builders<Event>.Update.Set(e => e.Resources, ev.Resources);
            var result = await _events.UpdateOneAsync(e => e.Id == eventId, update);

            return result.ModifiedCount > 0;
        }


        public async Task<PagedResult<Resource>> GetAllResourcesAsync(string eventId, int pageNumber, int pageSize)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null) return null;

            var resources = ev.Resources ?? new List<Resource>();
            var paged = resources.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            return new PagedResult<Resource>
            {
                Items = paged,
                TotalItems = resources.Count,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        //public async Task<PagedResult<Resource>> GetAllPublicResourcesAsync(string eventId, int pageNumber, int pageSize)
        //{
        //    var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
        //    if (ev == null) return null;

        //    var resources = ev.Resources ?? new List<Resource>();
        //    List<Resource> finalResources = new List<Resource>();
        //    foreach(var r  in resources)
        //        if(r.IsPublic == true)
        //            finalResources.Add(r);

        //    var paged = finalResources.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        //    return new PagedResult<Resource>
        //    {
        //        Items = paged,
        //        TotalItems = finalResources.Count,
        //        PageNumber = pageNumber,
        //        PageSize = pageSize
        //    };
        //}

        public async Task<List<Resource>> GetAllPublicResourcesAsync(string eventId)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null) return new List<Resource>();

            var resources = ev.Resources ?? new List<Resource>();

            // Return only those that are marked public
            return resources.Where(r => r.IsPublic == true).ToList();
        }



        public async Task<Resource?> GetResourceByIdAsync(string eventId, string resourceId)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            return ev?.Resources?.FirstOrDefault(r => r.Id == resourceId);
        }

        public async Task<bool> UpdateEventAsync(string id, EventDTO dto)
        {
            var filter = Builders<Event>.Filter.Eq(e => e.Id, id);
            var update = Builders<Event>.Update.Combine(
                Builders<Event>.Update.Set(e => e.Title, dto.Title),
                Builders<Event>.Update.Set(e => e.Description, dto.Description),
                Builders<Event>.Update.Set(e => e.Poster, dto.Poster),
                Builders<Event>.Update.Set(e => e.StartDate, dto.StartDate),
                Builders<Event>.Update.Set(e => e.EndDate, dto.EndDate),
                Builders<Event>.Update.Set(e => e.StartTime, dto.StartTime),
                Builders<Event>.Update.Set(e => e.Location, dto.Location),
                Builders<Event>.Update.Set(e => e.UpdatedAt, DateTime.UtcNow)
            );

            var result = await _events.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Resource>> UpsertResourceAsync(string eventId, Resource resource)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null) return null;

            ev.Resources ??= new List<Resource>();

            if (string.IsNullOrEmpty(resource.Id))
            {
                resource.Id = ObjectId.GenerateNewId().ToString();
                ev.Resources.Add(resource);
            }
            else
            {
                var existing = ev.Resources.FirstOrDefault(r => r.Id == resource.Id);
                if (existing != null)
                {
                    existing.Name = resource.Name;
                    existing.Type = resource.Type;
                    existing.Quantity = resource.Quantity;
                }
            }

            ev.UpdatedAt = DateTime.UtcNow;
            await _events.ReplaceOneAsync(e => e.Id == eventId, ev);

            return ev.Resources;
        }

        public async Task<bool> DeleteResourceAsync(string eventId, string resourceId)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null || ev.Resources == null) return false;

            ev.Resources = ev.Resources.Where(r => r.Id != resourceId).ToList();
            ev.UpdatedAt = DateTime.UtcNow;

            var result = await _events.ReplaceOneAsync(e => e.Id == eventId, ev);
            return result.ModifiedCount > 0;
        }

        public async Task<List<EventProgram>?> GetProgramsAsync(string eventId)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            return ev?.Programs ?? new List<EventProgram>();
        }

        public async Task<List<EventProgram>?> AddProgramAsync(string eventId, EventProgram program)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null) return null;

            ev.Programs ??= new List<EventProgram>();
            program.Id = ObjectId.GenerateNewId().ToString();
            ev.Programs.Add(program);
            ev.UpdatedAt = DateTime.UtcNow;

            await _events.ReplaceOneAsync(e => e.Id == eventId, ev);
            return ev.Programs;
        }

        public async Task<bool> UpdateProgramAsync(string eventId, string programId, EventProgram program)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null || ev.Programs == null) return false;

            var index = ev.Programs.FindIndex(p => p.Id == programId);
            if (index == -1) return false;

            program.Id = programId;
            ev.Programs[index] = program;
            ev.UpdatedAt = DateTime.UtcNow;

            var result = await _events.ReplaceOneAsync(e => e.Id == eventId, ev);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteProgramAsync(string eventId, string programId)
        {
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null || ev.Programs == null) return false;

            ev.Programs = ev.Programs.Where(p => p.Id != programId).ToList();
            ev.UpdatedAt = DateTime.UtcNow;

            var result = await _events.ReplaceOneAsync(e => e.Id == eventId, ev);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> PublishEventAsync(string eventId)
        {
            var filter = Builders<Event>.Filter.Eq(e => e.Id, eventId);
            var update = Builders<Event>.Update
                .Set(e => e.Status, "published")
                .Set(e => e.UpdatedAt, DateTime.UtcNow);

            var result = await _events.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }



        private EventDTO ToEventDto(Event e) => new EventDTO
        {
            Id = e.Id,
            OrganizerId = e.OrganizerId,
            Title = e.Title,
            Description = e.Description,
            Type = e.Type,
            Contact = e.Contact,
            Visibility = e.Visibility,
            Poster = e.Poster,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            StartTime = e.StartTime,
            Programs = e.Programs,
            Location = e.Location,
            Resources = e.Resources,
            Tickets = e.Tickets,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            Status = e.Status
        };

         public async Task<List<EventTicket>?> GetAllTicketsAsync(string eventId)
        {
            var eventDoc = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            return eventDoc?.Tickets;
        }

        public async Task<bool> AddTicketAsync(string eventId, EventTicket newTicket)
        {
            if (string.IsNullOrEmpty(newTicket.Id))
            {
                newTicket.Id = ObjectId.GenerateNewId().ToString();
            }

            // Find the event first
            var filter = Builders<Event>.Filter.Eq(e => e.Id, eventId);
            var existingEvent = await _events.Find(filter).FirstOrDefaultAsync();

            if (existingEvent == null) return false;

            // Check for duplicate ticket name (case-insensitive recommended)
            bool ticketExists = existingEvent.Tickets
                .Any(t => string.Equals(t.Name, newTicket.Name, StringComparison.OrdinalIgnoreCase));

            if (ticketExists)
            {
                throw new InvalidOperationException("A ticket with the same name already exists.");
            }

            // Add ticket if no duplicate
            var update = Builders<Event>.Update.Push(e => e.Tickets, newTicket);
            var result = await _events.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0;
        }


        public async Task<bool> UpdateTicketAsync(string eventId, string ticketId, EventTicket ticket)
        {
            // 1. Find the event
            var ev = await _events.Find(e => e.Id == eventId).FirstOrDefaultAsync();
            if (ev == null || ev.Tickets == null) return false;

            // 2. Find ticket index in the event's tickets
            var index = ev.Tickets.FindIndex(t => t.Id == ticketId);
            if (index == -1) return false;

            // 3. Keep the same ticket Id and replace the object
            ticket.Id = ticketId;
            ev.Tickets[index] = ticket;

            // 4. Update timestamp
            ev.UpdatedAt = DateTime.UtcNow;

            // 5. Save the updated event
            var result = await _events.ReplaceOneAsync(e => e.Id == eventId, ev);
            return result.ModifiedCount > 0;
        }


        public async Task<bool> DeleteTicketAsync(string eventId, string ticketId)
        {
            var filter = Builders<Event>.Filter.Eq(e => e.Id, eventId);
            var update = Builders<Event>.Update.PullFilter(e => e.Tickets, t => t.Id == ticketId);
            var result = await _events.UpdateOneAsync(filter, update);
            
            return result.ModifiedCount > 0;
        }
    }
}
