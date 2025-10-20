using MongoDB.Bson;
using MongoDB.Driver;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.Data;

namespace eventioBackend.Services
{
    public class FavoriteSupplierService : IFavoriteSupplier
    {
        private readonly IMongoCollection<FavoriteSuppliers> _favoriteCollection;
        private readonly IMongoCollection<Supplier> _supplierCollection;

        public FavoriteSupplierService(MongoDbService mongoDbService)
        {
            _favoriteCollection = mongoDbService.Database.GetCollection<FavoriteSuppliers>("favoriteSupplier");
            _supplierCollection = mongoDbService.Database.GetCollection<Supplier>("supplier");
        }

        public async Task<List<Supplier>> GetFavoriteForOrganizer(string organizerId)
        {
            if (!ObjectId.TryParse(organizerId, out ObjectId organizerObjId))
                return new List<Supplier>();

            var favorites = await _favoriteCollection
                .Find(f => f.OrganizerId == organizerId)
                .ToListAsync();

            var supplierIds = favorites
                .Where(f => f.SupplierId != null)
                .Select(f => new ObjectId(f.SupplierId))
                .ToList();

            if (!supplierIds.Any())
                return new List<Supplier>();

            var filter = Builders<Supplier>.Filter.In(s => s.Id, supplierIds.Select(id => id.ToString()));
            return await _supplierCollection.Find(filter).ToListAsync();
        }

        public async Task<FavoriteSuppliers> AddFavorite(string organizerId, string supplierId)
        {
            var existing = await _favoriteCollection
                .Find(f => f.OrganizerId == organizerId && f.SupplierId == supplierId)
                .FirstOrDefaultAsync();

            if (existing != null)
                return existing;

            var favorite = new FavoriteSuppliers
            {
                OrganizerId = organizerId,
                SupplierId = supplierId
            };

            await _favoriteCollection.InsertOneAsync(favorite);
            return favorite;
        }

        public async Task<FavoriteSuppliers> RemoveFavorite(string organizerId, string supplierId)
        {
            return await _favoriteCollection
                .FindOneAndDeleteAsync(f => f.OrganizerId == organizerId && f.SupplierId == supplierId);
        }
    }
}
