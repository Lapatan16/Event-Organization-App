namespace Eventio.Infrastructure.Services
{
    public class MongoResourceService : IResourceService
    {
        private readonly IMongoCollection<Resource> _resources;

        public MongoResourceService(IConfiguration config)
        {
            var client = new MongoClient(config["Mongo:ConnectionString"]);
            var db = client.GetDatabase(config["Mongo:Database"]);
            _resources = db.GetCollection<Resource>("Resources");
        }

        public async Task<List<Resource>> GetAllAsync() => await _resources.Find(_ => true).ToListAsync();
        public async Task<Resource> GetByIdAsync(string id) => await _resources.Find(r => r.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Resource resource) => await _resources.InsertOneAsync(resource);
        public async Task UpdateAsync(string id, Resource updated) => await _resources.ReplaceOneAsync(r => r.Id == id, updated);
        public async Task DeleteAsync(string id) => await _resources.DeleteOneAsync(r => r.Id == id);
    }
}

