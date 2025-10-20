using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace eventioBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteSupplierController : ControllerBase
    {
        private readonly IFavoriteSupplier _favoriteSupplierService;

        public FavoriteSupplierController(IFavoriteSupplier favoriteSupplierService)
        {
            _favoriteSupplierService = favoriteSupplierService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{organizerId}")]
        public async Task<ActionResult<List<Supplier>>> GetFavorites(string organizerId)
        {
            var favorites = await _favoriteSupplierService.GetFavoriteForOrganizer(organizerId);
            return Ok(favorites);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{organizerId}/{supplierId}")]
        public async Task<ActionResult<FavoriteSuppliers>> AddFavorite(string organizerId, string supplierId)
        {
            var favorite = await _favoriteSupplierService.AddFavorite(organizerId, supplierId);
            return Ok(favorite);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{organizerId}/{supplierId}")]
        public async Task<ActionResult<FavoriteSuppliers>> RemoveFavorite(string organizerId, string supplierId)
        {
            var removed = await _favoriteSupplierService.RemoveFavorite(organizerId, supplierId);
            if (removed == null)
                return NotFound();

            return Ok(removed);
        }
    }
}
