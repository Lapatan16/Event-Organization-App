using eventioBackend.Domain.Entities;

namespace eventioBackend.Domain.Interfaces
{
    public interface IFavoriteSupplier
    {
        Task<List<Supplier>> GetFavoriteForOrganizer(string organizerId);
        Task<FavoriteSuppliers> AddFavorite(string organizerId, string supplierId);
        Task<FavoriteSuppliers> RemoveFavorite(string organizerId, string supplierId);
    }
}
