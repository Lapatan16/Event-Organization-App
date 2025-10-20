using CarApi.Models;
using MongoDB.Driver;

namespace CarApi.Services;

public class CarService
{
    private readonly IMongoCollection<Car> _cars;

    public CarService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        var db = client.GetDatabase("CarDb");
        _cars = db.GetCollection<Car>("Cars");
    }

    public async Task<List<Car>> GetAsync() => await _cars.Find(_ => true).ToListAsync();

    public async Task<Car?> GetAsync(string id) => await _cars.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task CreateAsync(Car car) => await _cars.InsertOneAsync(car);

    public async Task UpdateAsync(string id, Car car) => await _cars.ReplaceOneAsync(c => c.Id == id, car);

    public async Task DeleteAsync(string id) => await _cars.DeleteOneAsync(c => c.Id == id);
}