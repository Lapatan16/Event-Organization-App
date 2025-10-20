namespace Eventio.Infrastructure.Services
{
    public class MongoUserService : IUserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly IPasswordHasher _hasher;

        public MongoUserService(IConfiguration config, IPasswordHasher hasher)
        {
            var client = new MongoClient(config["Mongo:ConnectionString"]);
            var db = client.GetDatabase(config["Mongo:Database"]);
            _users = db.GetCollection<User>("Users");
            _hasher = hasher;
        }

        public async Task<User> AuthenticateAsync(string email, string password)
        {
            var user = await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
            if (user == null || !_hasher.Verify(password, user.PasswordHash)) return null;
            return user;
        }

        public async Task RegisterAsync(User user, string password)
        {
            user.PasswordHash = _hasher.Hash(password);
            await _users.InsertOneAsync(user);
        }

        public async Task<User> GetByIdAsync(string id) => await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }
}