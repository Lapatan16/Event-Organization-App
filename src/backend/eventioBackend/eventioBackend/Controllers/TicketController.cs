using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Models;
using eventioBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace eventioBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly IMongoCollection<Ticket> _tickets;
        private readonly IConfiguration _configuration;
        private readonly QrCodeService _qrCodeService;
        private readonly SecurityService _securityService;

        public TicketController(MongoDbService mongoDbService, IConfiguration configuration, QrCodeService qrCodeService, SecurityService securityService)
        {
            _tickets = mongoDbService.Database?.GetCollection<Ticket>("ticket");
            _configuration = configuration;
            _qrCodeService = qrCodeService;
            _securityService = securityService;
        }

        [Authorize(Roles = "User")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetAllTickets()
        {
            var tickets = await _tickets.Find(_ => true).ToListAsync();

            var ticketDTO = tickets.Select(e => new TicketDTO
            {
                Id = e.Id,
                UserId = e.UserId,
                EventId = e.EventId,
                Name = e.Name,
                Price = e.Price,
                Quantity = e.Quantity,
                Date = e.Date,
                QRCode = e.QRCode,

            }).ToList();

            return Ok(ticketDTO);
        }

        [Authorize(Roles = "User")]
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDTO>> GetTicketById(string id)
        {
            var ticket = await _tickets.Find(e => e.Id == id).FirstOrDefaultAsync();

            if (ticket == null)
            {
                return NotFound();
            }

            var ticketDTO = new TicketDTO
            {
                Id = ticket.Id,
                UserId = ticket.UserId,
                EventId = ticket.EventId,
                Name = ticket.Name,
                Price = ticket.Price,
                Quantity = ticket.Quantity,
                Date = ticket.Date,
                QRCode = ticket.QRCode,
            };

            return Ok(ticketDTO);
        }

        [Authorize(Roles = "User")]
        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetTicketsByUserId(string userId)
        {
            var tickets = await _tickets.Find(e => e.UserId == userId).ToListAsync();

            if (tickets == null || tickets.Count == 0)
            {
                return NotFound();
            }

            var ticketsDto = tickets.Select(e => new TicketDTO
            {
                Id = e.Id,
                UserId = e.UserId,
                EventId = e.EventId,
                Name = e.Name,
                Price = e.Price,
                Quantity = e.Quantity,
                Date = e.Date,
                QRCode = e.QRCode,
                IsScanned = e.IsScanned,
                Services = e.Services,
            }).ToList();

            return Ok(ticketsDto);
        }

        [Authorize(Roles = "User")]
        [HttpGet("by-event/{eventId}")]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetTicketsByEventId(string eventId)
        {
            var tickets = await _tickets.Find(e => e.EventId == eventId).ToListAsync();

            if (tickets == null || tickets.Count == 0) { return NotFound(); }

            var ticketDTO = tickets.Select(e => new TicketDTO
            {
                Id = e.Id,
                UserId = e.UserId,
                EventId = e.EventId,
                Name = e.Name,
                Price = e.Price,
                Quantity = e.Quantity,
                Date = e.Date,
                QRCode = e.QRCode,
                IsScanned= e.IsScanned,
                Services = e.Services,
            }).ToList();

            return Ok(ticketDTO);
        }

        [Authorize(Roles = "User")]
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] Ticket newTicket)
        {
            if (newTicket == null) return BadRequest();

            if (string.IsNullOrEmpty(newTicket.Id))
                newTicket.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();

            newTicket.IsScanned = false;

            // Ako ticket ima servise, generiši Id za svaki koji nema
            if (newTicket.Services != null && newTicket.Services.Any())
            {
                foreach (var service in newTicket.Services)
                {
                    if (string.IsNullOrEmpty(service.Id))
                    {
                        service.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
                    }
                }
            }

            // generiši hash za tiket
            var hash = _securityService.GenerateHmac(newTicket.Id);

            // payload = ticketId + hash
            string payload = $"{newTicket.Id}:{hash}";

            newTicket.QRCode = _qrCodeService.GenerateQrCodeBase64(payload);

            await _tickets.InsertOneAsync(newTicket);

            return CreatedAtAction(nameof(GetTicketById), new { id = newTicket.Id }, newTicket);
        }

        // Ako ikada želimo da obnovimo QR (npr. promeni se payload format)

        [Authorize(Roles = "User")]
        [HttpPost("{id}/regenerate-qr")]
        public async Task<IActionResult> RegenerateQrCode(string id)
        {
            var ticket = await _tickets.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (ticket == null)
                return NotFound();

            // generiši novi hash (ako hoćeš da resetuješ QR)
            var hash = _securityService.GenerateHmac(ticket.Id);

            // payload = ticketId + hash
            string payload = $"{ticket.Id}:{hash}";

            ticket.QRCode = _qrCodeService.GenerateQrCodeBase64(payload);

            await _tickets.ReplaceOneAsync(t => t.Id == id, ticket);

            return Ok(ticket);
        }

        //[Authorize(Roles = "User")]
        [HttpGet("validate/{ticketId}/{hash}")]
        public async Task<IActionResult> ValidateTicket(string ticketId, string hash)
        {
            var ticket = await _tickets.Find(t => t.Id == ticketId).FirstOrDefaultAsync();

            if (ticket == null)
                return NotFound(new { status = "TICKET NOT FOUND" });

            if (ticket.IsScanned)
                return Ok(new { status = "ACCESS DENIED" });

            // proveri hash
            if (!_securityService.VerifyHmac(ticketId, hash))
                return Unauthorized(new { status = "INVALID QR" });

            // markiraj kao skenirano
            ticket.IsScanned = true;
            await _tickets.ReplaceOneAsync(t => t.Id == ticketId, ticket);

            return Ok(new { status = "ACCESS GRANTED" });
        }


        [Authorize(Roles = "User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(string id, [FromBody] Ticket updatedTicket)
        {
            if (updatedTicket == null)
                return BadRequest("Nedostaje telo zahteva.");

            var existingTicket = await _tickets.Find(t => t.Id == id).FirstOrDefaultAsync();

            if (existingTicket == null)
                return NotFound("Karta nije pronađena.");

           
            existingTicket.Name = updatedTicket.Name;
            existingTicket.Price = updatedTicket.Price;
            existingTicket.Quantity = updatedTicket.Quantity;
            existingTicket.Date = updatedTicket.Date;
            existingTicket.EventId = updatedTicket.EventId;
            existingTicket.UserId = updatedTicket.UserId;

            

            var result = await _tickets.ReplaceOneAsync(t => t.Id == id, existingTicket);

            if (result.IsAcknowledged && result.ModifiedCount > 0)
                return NoContent(); 

            return StatusCode(500, "Došlo je do greške pri ažuriranju karte.");
        }

        [Authorize(Roles = "User")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(string id)
        {
            var result = await _tickets.DeleteOneAsync(t => t.Id == id);

            if (result.DeletedCount == 0)
            {
                return NotFound("Karta sa datim ID-jem nije pronađena.");
            }

            return NoContent(); // 204 - uspešno obrisano
        }

    }
}
