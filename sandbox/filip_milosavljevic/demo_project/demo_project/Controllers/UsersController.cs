using demo_project.Data;
using demo_project.Entities;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace demo_project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMongoCollection<Users> _users;
        public UsersController(MongoDbService mongoDbService)
        {
            _users = mongoDbService.Database.GetCollection<Users>("users");
        }

        [HttpGet]
        public async Task<IEnumerable<Users>> Get()
        {
            return await _users.Find(FilterDefinition<Users>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Users?>> GetById(string id)
        {
            var filter = Builders<Users>.Filter.Eq(x => x.Id, id);
            var user = _users.Find(filter).FirstOrDefault();
            return user is not null ? Ok(user) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create(Users user)
        {
            await _users.InsertOneAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [HttpPut]
        public async Task<ActionResult> Update(Users user)
        {
            var filter = Builders<Users>.Filter.Eq(x => x.Id, user.Id);
            await _users.ReplaceOneAsync(filter, user);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<Users>.Filter.Eq(x => x.Id, id);
            await _users.DeleteOneAsync(filter);
            return Ok();
        }
    }
}
