using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using eventioBackend.Models;
using Microsoft.AspNetCore.Authorization;
using eventioBackend.Domain.Interfaces;

namespace eventioBackend.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            var user = await authService.RegisterAsync(request);
            if (user is null)
                return BadRequest("Korisnik već postoji");

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDTO>> Login(LoginDto request)
        {
            var result = await authService.LoginAsync(request);
            if (result is null)
                return BadRequest("Netačna e-mail adresa ili lozinka!");

            return Ok(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Odjavljivanje je frontend task (brisanje tokena sa klijenta)" });
        }


        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDTO>> RefreshToken(RefreshTokenRequestDTO request)
        {
            var result = await authService.RefreshTokensAsync(request);
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
                return Unauthorized("Refresh token nije validan ili je istekao.");

            return Ok(result);

        }

        [Authorize]
        [HttpGet("authenticated")]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("Autentifikovan korisnik!");
        }
        
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok("Autentifikovan si kao organizator!");
        }

        [Authorize(Roles = "Supplier")]
        [HttpGet("supplier")]
        public IActionResult SupplierOnlyEndpoint()
        {
            return Ok("Autentifikovan si kao dobavljac!");
        }

        [Authorize(Roles = "User")]
        [HttpGet("user")]
        public IActionResult UserOnlyEndpoint()
        {
            return Ok("Autentifikovan si kao korisnik!");
        }
    }
}