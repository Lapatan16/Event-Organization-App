using Azure.Core;
using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.DTOs;
using eventioBackend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace eventioBackend.Services
{
    public class AuthService() : IAuthService
    {

        private readonly IMongoCollection<User> _users;
        private readonly IConfiguration _configuration;

        public AuthService(MongoDbService mongoDbService, IConfiguration configuration): this()
        {
            _users = mongoDbService.Database?.GetCollection<User>("users")!;
            _configuration = configuration;
        }

        public async Task<TokenResponseDTO?> LoginAsync(LoginDto request)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Email, request.Email);
            var user = await _users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
                return null;

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result == PasswordVerificationResult.Failed)
                return null;

            return await CreateTokenResponse(user);
        }

        private async Task<TokenResponseDTO> CreateTokenResponse(User user)
        {
            return new TokenResponseDTO
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user),
                UserId = user.Id,
                Role = user.Role,
                Avatar = user.Avatar
            };
        }

        public async Task<User?> RegisterAsync(UserDto request)
        {
            var existingUser = await _users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existingUser != null)
                return null;

            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = request.Role,
                Phone = request.Phone,
            };

            var hasher = new PasswordHasher<User>();
            user.PasswordHash = hasher.HashPassword(user, request.Password);

            await _users.InsertOneAsync(user);

            return user;
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<TokenResponseDTO?> RefreshTokensAsync(RefreshTokenRequestDTO request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
            if (user is null)
                return null;

            return await CreateTokenResponse(user);
        }

        private async Task<User?> ValidateRefreshTokenAsync(string userId, string refreshToken)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user is null || user.RefreshToken != refreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            var update = Builders<User>.Update
                .Set(u => u.RefreshToken, user.RefreshToken)
                .Set(u => u.RefreshTokenExpiryTime, user.RefreshTokenExpiryTime);

            await _users.UpdateOneAsync(filter, update);

            return refreshToken;
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Email, user.Email ?? ""),
        new Claim(ClaimTypes.NameIdentifier, user.Id ?? ""),
        new Claim(ClaimTypes.Role, user.Role ?? "")
    };

            // Dodajemo avatar kao claim.
            // Ako je user.Avatar null, stavi prazan string kako bi se izbegle greške.
            claims.Add(new Claim("avatar", user.Avatar ?? ""));

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var token = new JwtSecurityToken(
                issuer: _configuration["AppSettings:Issuer"],
                audience: _configuration["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
