using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.DTOs;
using eventioBackend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace eventioBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResourceController : ControllerBase
    {
        private readonly IResourceService _service;

        public ResourceController(IResourceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var resources = await _service.GetAllAsync();


            var result = resources.Select(r => new ResourceDto
            {
                Id = r.Id,
                Name = r.Name,
                Type = r.Type,
                Contact = r.Contact,
                Description = r.Description,
                Adress = r.Adress,
                City = r.City,
                CreatedAt = r.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var r = await _service.GetByIdAsync(id);
            if (r == null) return NotFound();

            var dto = new ResourceDto
            {
                Id = r.Id,
                Name = r.Name,
                Type = r.Type,
                Contact = r.Contact,
                Description = r.Description,
                Adress = r.Adress,
                City = r.City,
                CreatedAt = r.CreatedAt
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateResourceDto dto)
        {
            var resource = new Resources
            {
                Name = dto.Name,
                Type = dto.Type,
                Contact = dto.Contact,
                Description = dto.Description,
                Adress = dto.Adress,
                City = dto.City,
                CreatedAt = DateTime.UtcNow,
                SupplierId = ""
            };

            await _service.CreateAsync(resource);
            return CreatedAtAction(nameof(GetById), new { id = resource.Id }, resource);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, ResourceDto dto)
        {
            var updated = new Resources
            {
                Id = id,
                Name = dto.Name,
                Type = dto.Type,
                Contact = dto.Contact,
                Description = dto.Description,
                Adress = dto.Adress,
        City = dto.City,
        CreatedAt = DateTime.UtcNow,
        SupplierId = ""
            };

            await _service.UpdateAsync(id, updated);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}