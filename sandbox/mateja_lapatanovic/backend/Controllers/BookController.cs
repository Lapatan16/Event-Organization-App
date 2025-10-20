using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Runtime.InteropServices;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IMongoCollection<Book> _books;

        public BookController(MongoDbService mongoDbService)
        {
            this._books = mongoDbService.Database?.GetCollection<Book>("Books");
        }

        [HttpGet]
        public async Task<IEnumerable<Book>> Get()
        {
            return await _books.Find(FilterDefinition<Book>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetById(string id)
        {
            var filter = Builders<Book>.Filter.Eq(x => x.Id, id);
            var book = _books.Find(filter).FirstOrDefault();
            return book is not null ? Ok(book) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Post(Book book)
        {
            await _books.InsertOneAsync(book);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(Book book)
        {
            var filter = Builders<Book>.Filter.Eq(x => x.Id, book.Id);
            await _books.ReplaceOneAsync(filter, book);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<Book>.Filter.Eq(x => x.Id, id);
            await _books.DeleteOneAsync(filter);
            return Ok();
        }


    }
}
