using MongoDB.Driver;

namespace eventioBackend.Data
{
    public class MongoDbService
    {
        private readonly IMongoDatabase? _database;
        private readonly IConfiguration _configuration;

        public MongoDbService(IConfiguration configuration)
        {
            _configuration = configuration;

            var connectionUri = _configuration["MongoDB:ConnectionString"];
            var dbName = _configuration["MongoDB:DatabaseName"];

            var settings = MongoClientSettings.FromConnectionString(connectionUri);
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            var client = new MongoClient(settings);

            _database = client.GetDatabase("eventioDb");
        }

        public IMongoDatabase? Database => _database;
    }
}
