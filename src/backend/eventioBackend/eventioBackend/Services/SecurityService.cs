using System.Security.Cryptography;
using System.Text;

namespace eventioBackend.Services
{
    public class SecurityService
    {
        private readonly string _secretKey;

        public SecurityService(IConfiguration configuration)
        {
            _secretKey = configuration["JwtSettings:SecretKey"] ?? throw new ArgumentNullException("SecretKey");
        }

        public string GenerateHmac(string input)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secretKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(hashBytes);
        }

        public bool VerifyHmac(string input, string providedHash)
        {
            var expectedHash = GenerateHmac(input);
            return expectedHash == providedHash;
        }
    }
}
