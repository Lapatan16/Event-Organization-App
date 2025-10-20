namespace Eventio.Application.Interfaces
{
    public interface IResourceService
    {
        Task<List<Resource>> GetAllAsync();
        Task<Resource> GetByIdAsync(string id);
        Task CreateAsync(Resource resource);
        Task UpdateAsync(string id, Resource updated);
        Task DeleteAsync(string id);
    }
}