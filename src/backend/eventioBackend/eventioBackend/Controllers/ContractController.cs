using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace eventioBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ContractController : ControllerBase
    {
        private readonly IMongoCollection<Contract> _contract;
        private readonly IConfiguration _configuration;

        public ContractController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _contract = mongoDbService.Database?.GetCollection<Contract>("contract");
            _configuration = configuration;
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contract>>> GetAll()
        {
            var contracts = await _contract.Find(_ => true).ToListAsync();
            return Ok(contracts);
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Contract>> GetById(string id)
        {
            var contract = await _contract.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (contract == null)
                return NotFound();

            return Ok(contract);
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<Contract>>> GetByEventId(string eventId)
        {
            var contracts = await _contract.Find(c => c.EventId == eventId).ToListAsync();
            return Ok(contracts);
        }

        // GET: api/contract/by-resource/{resourceId}
        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet("by-resource/{resourceId}")]
        public async Task<ActionResult<IEnumerable<Contract>>> GetByResourceId(string resourceId)
        {
            var contracts = await _contract.Find(c => c.ResourceId == resourceId).ToListAsync();
            return Ok(contracts);
        }

        // GET: api/contract/by-supplier/{supplierId}
        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet("by-supplier/{supplierId}")]
        public async Task<ActionResult<IEnumerable<Contract>>> GetBySupplierId(string supplierId)
        {
            var contracts = await _contract.Find(c => c.SupplierId == supplierId).ToListAsync();
            return Ok(contracts);
        }

        // GET: api/contract/by-product/{productId}
        [Authorize(Roles = "Admin,Supplier")]
        [HttpGet("by-product/{productId}")]
        public async Task<ActionResult<IEnumerable<Contract>>> GetByProductId(string productId)
        {
            var contracts = await _contract.Find(c => c.ProductId == productId).ToListAsync();
            return Ok(contracts);
        }

        // POST: api/contract
        [Authorize(Roles = "Admin,Supplier")]
        [HttpPost]
        public async Task<ActionResult<Contract>> CreateContract([FromBody] Contract contract)
        {
            contract.Id = ObjectId.GenerateNewId().ToString();
            await _contract.InsertOneAsync(contract);
            return CreatedAtAction(nameof(GetById), new { id = contract.Id }, contract);
        }

        // PUT: api/contract/{id}
        [Authorize(Roles = "Admin,Supplier")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContract(string id, [FromBody] Contract updated)
        {
            var existing = await _contract.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existing == null)
                return NotFound();

            updated.Id = id; // make sure it stays consistent
            var result = await _contract.ReplaceOneAsync(c => c.Id == id, updated);

            if (!result.IsAcknowledged || result.MatchedCount == 0)
                return StatusCode(500, "Failed to update the contract.");

            return Ok(updated);
        }

        [Authorize(Roles = "Supplier")]
        [HttpPut("Contract/{id}/seal")]
        public async Task<IActionResult> SealContract(string id)
        {
            var filter = Builders<Contract>.Filter.Eq(c => c.Id, id);
            var update = Builders<Contract>.Update.Set(c => c.Status, "sealed");

            var result = await _contract.UpdateOneAsync(filter, update);

            if (result.ModifiedCount == 0)
                return NotFound();

            return NoContent();
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpPut("upsert")]
        public async Task<IActionResult> UpsertContract([FromBody] Contract contract)
        {
            var filter = Builders<Contract>.Filter.And(
                Builders<Contract>.Filter.Eq(c => c.ResourceId, contract.ResourceId),
                Builders<Contract>.Filter.Eq(c => c.SupplierId, contract.SupplierId),
                Builders<Contract>.Filter.Eq(c => c.ProductId, contract.ProductId)
            );

            var existing = await _contract.Find(filter).FirstOrDefaultAsync();

            if (existing != null)
            {
                // Update quantity and price
                existing.Quantity += contract.Quantity;
                existing.Price += contract.Price;
                existing.Status = contract.Status; // optional: override or keep old status?

                await _contract.ReplaceOneAsync(filter, existing);
                return Ok(existing);
            }
            else
            {
                contract.Id = ObjectId.GenerateNewId().ToString();
                await _contract.InsertOneAsync(contract);
                return CreatedAtAction(nameof(GetById), new { id = contract.Id }, contract);
            }
        }


        // DELETE: api/contract/{id}
        [Authorize(Roles = "Admin,Supplier")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContract(string id)
        {
            var result = await _contract.DeleteOneAsync(c => c.Id == id);

            if (result.DeletedCount == 0)
                return NotFound();

            return Ok($"Contract {id} deleted successfully.");
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpDelete("by-resource/{resourceId}")]
        public async Task<IActionResult> DeleteContractsByResource(string resourceId)
        {
            var filter = Builders<Contract>.Filter.Eq(c => c.ResourceId, resourceId);
            var result = await _contract.DeleteManyAsync(filter);

            if (result.DeletedCount > 0)
                return Ok(new { deleted = result.DeletedCount });

            return NotFound("No contracts found for this resource.");
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpDelete("by-resource-supplier/{resourceId}/{supplierId}")]
        public async Task<IActionResult> DeleteContractsByResourceAndSupplier(string resourceId, string supplierId)
        {
            var filter = Builders<Contract>.Filter.And(
                Builders<Contract>.Filter.Eq(c => c.ResourceId, resourceId),
                Builders<Contract>.Filter.Eq(c => c.SupplierId, supplierId)
            );

            var result = await _contract.DeleteManyAsync(filter);

            if (result.DeletedCount > 0)
                return Ok(new { deleted = result.DeletedCount });

            return NotFound("No contracts found for this supplier in the given resource.");
        }

        [Authorize(Roles = "Admin,Supplier")]
        [HttpDelete("{resourceId}/{supplierId}/{productId}")]
        public async Task<IActionResult> DeleteContract(string resourceId, string supplierId, string productId)
        {
            var filter = Builders<Contract>.Filter.And(
                Builders<Contract>.Filter.Eq(c => c.ResourceId, resourceId),
                Builders<Contract>.Filter.Eq(c => c.SupplierId, supplierId),
                Builders<Contract>.Filter.Eq(c => c.ProductId, productId)
            );

            var result = await _contract.DeleteOneAsync(filter);

            if (result.DeletedCount == 1)
                return Ok("Contract deleted successfully.");

            return NotFound("Contract not found.");
        }
    }
}
