using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace eventioBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly IMongoCollection<Supplier> _supplier;
        private readonly IConfiguration _configuration;

        public SupplierController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _supplier = mongoDbService.Database?.GetCollection<Supplier>("supplier");
            _configuration = configuration;
        }

        [Authorize(Roles = "Supplier,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var suppliers = await _supplier.Find(_ => true).ToListAsync();
            return Ok(suppliers);
        }

        [Authorize(Roles = "Supplier")]
        [HttpGet("{id:length(24)}")]
        public async Task<IActionResult> GetById(string id)
        {
            var supplier = await _supplier.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (supplier == null) return NotFound();
            return Ok(supplier);
        }

        [Authorize(Roles = "Supplier")]
        [HttpGet("by-supplier/{supplierId:length(24)}")]
        public async Task<IActionResult> GetBySupplierId(string supplierId)
        {
            var suppliers = await _supplier.Find(s => s.SupplierId == supplierId).ToListAsync();
            return Ok(suppliers);
        }
        
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Supplier supplier)
        {
            var existingSupplier = await _supplier
                .Find(s => s.Name.ToLower() == supplier.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingSupplier != null)
            {
                return Conflict(new { message = $"Dobavljač sa imenom '{supplier.Name}' već postoji." });
            }

            if (supplier.Products != null)
            {
                foreach (var product in supplier.Products)
                {
                    product.Id = ObjectId.GenerateNewId().ToString();
                }
            }

            await _supplier.InsertOneAsync(supplier);
            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
        }

        [Authorize(Roles = "Supplier")]
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, [FromBody] Supplier updatedSupplier)
        {
            var existingSupplier = await _supplier.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (existingSupplier == null) return NotFound();

            var updateDef = Builders<Supplier>.Update.Combine();

            if (!string.IsNullOrEmpty(updatedSupplier.Name))
                updateDef = updateDef.Set(s => s.Name, updatedSupplier.Name);

            if (!string.IsNullOrEmpty(updatedSupplier.Type))
                updateDef = updateDef.Set(s => s.Type, updatedSupplier.Type);

            if (!string.IsNullOrEmpty(updatedSupplier.Contact))
                updateDef = updateDef.Set(s => s.Contact, updatedSupplier.Contact);

            if (!string.IsNullOrEmpty(updatedSupplier.Description))
                updateDef = updateDef.Set(s => s.Description, updatedSupplier.Description);

            if (!string.IsNullOrEmpty(updatedSupplier.Poster))
                updateDef = updateDef.Set(s => s.Poster, updatedSupplier.Poster);

            if (updatedSupplier.Products != null && updatedSupplier.Products.Any())
            {
                foreach (var product in updatedSupplier.Products)
                {
                    if (string.IsNullOrEmpty(product.Id))
                        product.Id = ObjectId.GenerateNewId().ToString();
                }
                updateDef = updateDef.Set(s => s.Products, updatedSupplier.Products);
            }

            // If no fields were set (all null or empty), return BadRequest
            if (updateDef == Builders<Supplier>.Update.Combine())
                return BadRequest("No valid fields provided to update.");

            var result = await _supplier.UpdateOneAsync(s => s.Id == id, updateDef);

            if (!result.IsAcknowledged || result.MatchedCount == 0)
                return NotFound();

            return NoContent();
        }


        [Authorize(Roles = "Supplier")]
        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _supplier.DeleteOneAsync(s => s.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Supplier")]
        [HttpPut("{supplierId:length(24)}/product")]
        public async Task<IActionResult> UpsertProduct(string supplierId, [FromBody] Product product)
        {
            var supplier = await _supplier.Find(s => s.Id == supplierId).FirstOrDefaultAsync();
            if (supplier == null) return NotFound();

            supplier.Products ??= new List<Product>();

            bool nameExists = supplier.Products.Any(p =>
                p.Name?.Trim().ToLower() == product.Name?.Trim().ToLower() &&
                p.Id != product.Id
            );

            if (nameExists)
            {
                return BadRequest($"A product with the name '{product.Name}' already exists.");
            }

            if (string.IsNullOrEmpty(product.Id))
            {
                product.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
                supplier.Products.Add(product);
            }
            else
            {
                var existingProduct = supplier.Products.FirstOrDefault(p => p.Id == product.Id);
                if (existingProduct != null)
                {
                    existingProduct.Name = product.Name;
                    existingProduct.Amount = product.Amount;
                    existingProduct.Unit = product.Unit;
                    existingProduct.Price = product.Price;
                }
                else
                {
                    supplier.Products.Add(product);
                }
            }

            await _supplier.ReplaceOneAsync(s => s.Id == supplierId, supplier);
            return Ok(supplier);
        }

        [Authorize(Roles = "Supplier")]
        [HttpDelete("{supplierId:length(24)}/product/{productId:length(24)}")]
        public async Task<IActionResult> DeleteProduct(string supplierId, string productId)
        {
            var supplier = await _supplier.Find(s => s.Id == supplierId).FirstOrDefaultAsync();
            if (supplier == null) return NotFound();

            var removed = supplier.Products?.RemoveAll(p => p.Id == productId) > 0;

            if (!removed) return NotFound("Product not found in supplier.");

            await _supplier.ReplaceOneAsync(s => s.Id == supplierId, supplier);
            return NoContent();
        }


        //[HttpGet] Pagginacija za getAll - trenutno ostavljeno za kasnije
        //public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        //{
        //    if (pageNumber <= 0 || pageSize <= 0)
        //        return BadRequest("Page number and page size must be greater than zero.");

        //    var totalCount = await _supplier.CountDocumentsAsync(_ => true);
        //    var suppliers = await _supplier.Find(_ => true)
        //        .Skip((pageNumber - 1) * pageSize)
        //        .Limit(pageSize)
        //        .ToListAsync();

        //    var response = new
        //    {
        //        TotalCount = totalCount,
        //        PageNumber = pageNumber,
        //        PageSize = pageSize,
        //        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        //        Data = suppliers
        //    };

        //    return Ok(response);
        //}
    }
}
