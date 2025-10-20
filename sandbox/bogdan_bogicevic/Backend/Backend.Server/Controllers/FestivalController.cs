using Backend.Server.Data;
using Backend.Server.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Backend.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FestivalController : ControllerBase
    {
        private readonly IMongoCollection<Festival>? _festivali;
        public FestivalController(MongoDbService mongoDbService)
        {
            _festivali = mongoDbService.Database?.GetCollection<Festival>("Festivali");
        }

        [HttpGet]
        public async Task<IEnumerable<Festival>> Get()
        {
            return await _festivali.Find(FilterDefinition<Festival>.Empty).ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Festival>> GetById(string id)
        {
            var filter = Builders<Festival>.Filter.Eq(x => x.Id, id);
            var festival = _festivali.Find(filter).FirstOrDefault();
            return festival is not null ? Ok(festival) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create(Festival festival)
        {
            await _festivali.InsertOneAsync(festival);
            return CreatedAtAction(nameof(GetById), new { id = festival.Id }, festival);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(Festival festival)
        {
            var filter = Builders<Festival>.Filter.Eq(x => x.Id, festival.Id);
            await _festivali.ReplaceOneAsync(filter, festival);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<Festival>.Filter.Eq(x => x.Id, id);
            await _festivali.DeleteOneAsync(filter);
            return Ok();
        }
    }
}
