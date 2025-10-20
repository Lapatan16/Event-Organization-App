namespace Eventio.Infrastructure.Services
{
    public class MongoEventService : IEventService
    {
        private readonly IMongoCollection<Event> _events;

        public MongoEventService(IConfiguration config)
        {
            var client = new MongoClient(config["Mongo:ConnectionString"]);
            var db = client.GetDatabase(config["Mongo:Database"]);
            _events = db.GetCollection<Event>("Events");
        }

        public async Task<List<Event>> GetAllAsync() => await _events.Find(_ => true).ToListAsync();
        public async Task<Event> GetByIdAsync(string id) => await _events.Find(e => e.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Event e) => await _events.InsertOneAsync(e);
        public async Task UpdateAsync(string id, Event updated) => await _events.ReplaceOneAsync(e => e.Id == id, updated);
        public async Task DeleteAsync(string id) => await _events.DeleteOneAsync(e => e.Id == id);
    }
}
