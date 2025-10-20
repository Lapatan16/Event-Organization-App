using eventioBackend.Domain.Entities;
using eventioBackend.Models;
using Microsoft.AspNetCore.Mvc;

namespace eventioBackend.Domain.Interfaces
{
    public interface IEventService
    {
        Task<PagedResult<EventDTO>> GetAllEventsAsync(int pageNumber, int pageSize);
        Task<PagedResult<EventDTO>> GetAllEventsByCategoryAsync(int pageNumber, int pageSize, string category);
        Task<PagedResult<PublicEventDTO>> GetAllPublicEventsAsync(int pageNumber, int pageSize);
        Task<EventDTO?> GetEventByIdAsync(string id);
        Task<PublicEventDTO?> GetPublicEventByIdAsync(string id);
        Task<EventTitleDTO?> GetEventTitleAsync(string id);
        Task<PagedResult<EventDTO>> GetEventsByOrganizerIdAsync(string organizerId, int pageNumber, int pageSize);
        Task<Event> CreateEventAsync(Event newEvent);
        Task<PagedResult<Resource>> GetAllResourcesAsync(string eventId, int pageNumber, int pageSize);
        //Task<PagedResult<Resource>> GetAllPublicResourcesAsync(string eventId, int pageNumber, int pageSize);
        Task<List<Resource>> GetAllPublicResourcesAsync(string eventId);
        Task<Resource?> GetResourceByIdAsync(string eventId, string resourceId);
        Task<bool> UpdateEventAsync(string id, EventDTO eventDto);
        Task<List<Resource>> UpsertResourceAsync(string eventId, Resource resource);
        Task<bool> DeleteResourceAsync(string eventId, string resourceId);
        Task<List<EventProgram>?> GetProgramsAsync(string eventId);
        Task<List<EventProgram>?> AddProgramAsync(string eventId, EventProgram program);
        Task<bool> UpdateProgramAsync(string eventId, string programId, EventProgram program);
        Task<bool> DeleteProgramAsync(string eventId, string programId);
        Task<List<EventTicket>?> GetAllTicketsAsync(string eventId);
        Task<bool> AddTicketAsync(string eventId, EventTicket newTicket);
        Task<bool> UpdateTicketAsync(string eventId, string ticketId, EventTicket updatedTicket);
        Task<bool> DeleteTicketAsync(string eventId, string ticketId);
        Task<IEnumerable<PublicEventDTO>> GetPublicEventsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<bool> PublishEventAsync(string eventId);
        Task<bool> IncrementResourceReservedAsync(string eventId, string resourceId, int quantity);

    }
}
