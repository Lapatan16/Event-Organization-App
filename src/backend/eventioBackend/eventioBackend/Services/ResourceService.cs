using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.DTOs;
using eventioBackend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using System.Security.Claims;
using System.Text;

namespace eventioBackend.Services
{
    public class ResourceService : IResourceService
    {
         private readonly IMongoCollection<Resources> _resources;

        public ResourceService(MongoDbService mongoDbService)
        {
            _resources = mongoDbService.Database!.GetCollection<Resources>("Resources");
        }



        public async Task<List<Resources>> GetAllAsync() => await _resources.Find(_ => true).ToListAsync();
        public async Task<Resources> GetByIdAsync(string id) => await _resources.Find(r => r.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Resources resource) => await _resources.InsertOneAsync(resource);
        public async Task UpdateAsync(string id, Resources updated) => await _resources.ReplaceOneAsync(r => r.Id == id, updated);
        public async Task DeleteAsync(string id) => await _resources.DeleteOneAsync(r => r.Id == id);
    }
}