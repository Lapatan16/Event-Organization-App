using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace eventioBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;

        public UserController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _users = mongoDbService.Database?.GetCollection<User>("users");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IEnumerable<User>> Get()
        {
            return await _users.Find(FilterDefinition<User>.Empty).ToListAsync();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<User?>> GetById(string id)
        {
            var user = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
            return user is not null ? Ok(user) : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult> Create(User user)
        {

            if (string.IsNullOrEmpty(user.Avatar))
            {
                user.Avatar = "data:image/webp;base64,UklGRlYBAABXRUJQVlA4IEoBAABQDgCdASqAAIAAPm02l0gkIyIhJpTpaIANiWkADpsAsuwGUDDxM5bskR7vUgUmF4z1dCNXZvOGnlHY1r/c0stgqjZyln6GrG/c2ciZ3KnR8zbSv/Bb4flVobI+nUtoAhOFDkk2xa3k3TGLhNkUaT1Ny7eEbIWBS9OeKAAA/vshhZ76z4JaWqlhYhuAdT8h6if6qQgKlG2lGJN3sCKAWtgpruT0jwD6ACqhAOiQJ7Gv95rkp/Ivoyy6B6LabwlWDGD7gCpLJE15e71/7WCTeCN56VEmdawhINLV65FjxwwrZDB7GjgG0SqzFn16HIAG+ATr6Hjs/etKcVO1FlhAFSogoh7RF662nTyY89Wqlt8FwTmVnWe3ms6I1V/eFa9wPolbjKcnGkDFaj7BZADO5/T/2gBToQDomcbcjUiADjPPZ0AawBL7HYAAAAA="; // ovde staviš svoj default avatar
            }

            await _users.InsertOneAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [Authorize]
        [HttpPut]
        public async Task<ActionResult> Update(UserUpdateDTO dto)
        {
            var existingUser = await _users.Find(x => x.Id == dto.Id).FirstOrDefaultAsync();

            if (existingUser == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email.ToLower() != existingUser.Email.ToLower())
            {
                var emailExists = await _users.Find(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != dto.Id).AnyAsync();
                if (emailExists)
                    return Conflict("Korisnik sa tom e-mail adresom već postoji.");
            }

            if (dto.Email != null) existingUser.Email = dto.Email;
            if (dto.FirstName != null) existingUser.FirstName = dto.FirstName;
            if (dto.LastName != null) existingUser.LastName = dto.LastName;
            if (dto.Avatar != null) existingUser.Avatar = dto.Avatar;


            var result = await _users.ReplaceOneAsync(x => x.Id == dto.Id, existingUser);

            return result.ModifiedCount > 0 ? Ok() : NotFound();
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var result = await _users.DeleteOneAsync(x => x.Id == id);
            return result.DeletedCount > 0 ? Ok() : NotFound();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email is null)
                return Unauthorized("Email nije pronadjen u tokenu.");

            var user = await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
            return user is not null ? Ok(user) : NotFound("Korisnik nije pronadjen.");
        }
    }
}
