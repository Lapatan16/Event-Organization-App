using MongoDB.Driver;
using studenticrud.Models;
using Microsoft.Extensions.Options;

namespace studenticrud.Services;

public class studentiService
{
    private readonly IMongoCollection<studentiModel> _studenti;

    public studentiService(IConfiguration config)
    {
        var client = new MongoClient(config["studentiDatabaseSettings:ConnectionString"]);
        var database = client.GetDatabase(config["studentiDatabaseSettings:DatabaseName"]);
        _studenti = database.GetCollection<studentiModel>(config["studentiDatabaseSettings:CollectionName"]);
    }

    public List<studentiModel> Get() => _studenti.Find(t => true).ToList();

    public studentiModel Get(string id) => _studenti.Find(t => t.Id == id).FirstOrDefault();

    public studentiModel Create(studentiModel item)
    {
        _studenti.InsertOne(item);
        return item;
    }

public void Update(string id, studentiModel item)
{
    var filter = Builders<studentiModel>.Filter.Eq(s => s.Id, id);
    
    var update = Builders<studentiModel>.Update
        .Set(s => s.ime, item.ime)
        .Set(s => s.prezime, item.prezime)
        .Set(s => s.brojindeksa, item.brojindeksa);

    var result = _studenti.UpdateOne(filter, update);

    if (result.MatchedCount == 0)
        throw new Exception("Student sa datim ID nije pronađen");
}



    public void Delete(string id) =>
        _studenti.DeleteOne(t => t.Id == id);
}
