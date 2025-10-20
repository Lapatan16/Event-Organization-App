namespace eventioBackend.DTOs
{
    public class UserDto
    {
        public string? Id { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Role { get; set; }
        public string? Phone { get; set; }
    }
}
