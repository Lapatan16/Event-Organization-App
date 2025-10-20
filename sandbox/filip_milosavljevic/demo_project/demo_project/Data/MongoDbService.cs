using MongoDB.Driver;

namespace demo_project.Data
{
    public class MongoDbService
    {
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase? _database;

        public MongoDbService(IConfiguration configuration)
        {
            _configuration = configuration;

            var connectionString = _configuration.GetConnectionString("DbConnection");
            var mongoClient = new MongoClient(connectionString);
            _database = mongoClient.GetDatabase("compailcrew");
        }

        public IMongoDatabase? Database => _database;
    }
}
