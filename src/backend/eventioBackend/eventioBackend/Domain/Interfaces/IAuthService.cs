using eventioBackend.Domain.Entities;
using eventioBackend.DTOs;
using eventioBackend.Models;

namespace eventioBackend.Domain.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);
        Task<TokenResponseDTO?> LoginAsync(LoginDto request);
        Task<TokenResponseDTO?> RefreshTokensAsync(RefreshTokenRequestDTO requst);
    }
}
