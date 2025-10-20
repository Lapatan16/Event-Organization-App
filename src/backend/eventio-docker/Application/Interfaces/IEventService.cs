namespace Eventio.Application.Interfaces
{
    public interface IEventService
    {
        Task<List<Event>> GetAllAsync();
        Task<Event> GetByIdAsync(string id);
        Task CreateAsync(Event newEvent);
        Task UpdateAsync(string id, Event updated);
        Task DeleteAsync(string id);
    }
}
