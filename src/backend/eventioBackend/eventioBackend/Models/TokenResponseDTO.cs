namespace eventioBackend.Models
{
    public class TokenResponseDTO
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public required string UserId { get; set; }
        public required string Role {  get; set; }
        public string? Avatar { get; set; }
    }
}
