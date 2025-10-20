using MongoDB.Driver;

namespace Backend.Server.Data
{
    public class MongoDbService
    {
        private readonly IConfiguration _configuration;
        private readonly IMongoDatabase? _database;

        public MongoDbService(IConfiguration configuration)
        {
            _configuration = configuration;

            var conncetionString = _configuration.GetConnectionString("DbConnection");
            var mongoUrl = MongoUrl.Create(conncetionString);
            var mongoCLient = new MongoClient(mongoUrl);
            _database = mongoCLient.GetDatabase(mongoUrl.DatabaseName);
        }

        public IMongoDatabase? Database => _database;
    }
}
