using eventioBackend.Domain.Entities;
using eventioBackend.DTOs;
using eventioBackend.Models;

namespace eventioBackend.Domain.Interfaces
{
    public interface IResourceService
    {
        Task<List<Resources>> GetAllAsync();
        Task<Resources> GetByIdAsync(string id);
        Task CreateAsync(Resources resource);
        Task UpdateAsync(string id, Resources updated);
        Task DeleteAsync(string id);
    }
}