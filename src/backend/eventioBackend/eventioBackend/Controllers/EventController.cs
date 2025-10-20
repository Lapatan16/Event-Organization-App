using eventioBackend.Data;
using eventioBackend.Domain.Entities;
using eventioBackend.Domain.Interfaces;
using eventioBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace eventioBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<PagedResult<EventDTO>>> GetAllEvents([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
            => Ok(await _eventService.GetAllEventsAsync(pageNumber, pageSize));

        [Authorize(Roles = "Admin")]
        [HttpGet("by-category")]
        public async Task<ActionResult<PagedResult<EventDTO>>> GetAllEventsByCategory([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string category = "")
            => Ok(await _eventService.GetAllEventsByCategoryAsync(pageNumber, pageSize, category));

        [Authorize(Roles = "Admin,User")]
        [HttpGet("public")]
        public async Task<ActionResult<PagedResult<PublicEventDTO>>> GetAllPublicEvents([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
            => Ok(await _eventService.GetAllPublicEventsAsync(pageNumber, pageSize));

        [Authorize(Roles = "Admin,User")]
        [HttpGet("publicByDateRange")]
        public async Task<ActionResult<IEnumerable<PublicEventDTO>>> GetPublicEventsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
        => Ok(await _eventService.GetPublicEventsByDateRangeAsync(startDate, endDate));

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDTO>> GetEventById(string id)
        {
            var result = await _eventService.GetEventByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("public/{id}")]
        public async Task<ActionResult<PublicEventDTO>> GetPublicEventById(string id)
        {
            var result = await _eventService.GetPublicEventByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin,User,Supplier")]
        [HttpGet("event-title/{id}")]
        public async Task<ActionResult<EventTitleDTO>> GetEventName(string id)
        {
            var result = await _eventService.GetEventTitleAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("by-organizer/{organizerId}")]
        public async Task<ActionResult<PagedResult<EventDTO>>> GetEventsByOrganizerId(string organizerId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
            => Ok(await _eventService.GetEventsByOrganizerIdAsync(organizerId, pageNumber, pageSize));

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] Event newEvent)
        {
            var created = await _eventService.CreateEventAsync(newEvent);
            return CreatedAtAction(nameof(GetEventById), new { id = created.Id }, created);
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(string id, [FromBody] EventDTO eventDto)
        {
            var updated = await _eventService.UpdateEventAsync(id, eventDto);
            return updated ? NoContent() : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{eventId}/resources")]
        public async Task<ActionResult<PagedResult<Resource>>> GetAllResources(string eventId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
            => Ok(await _eventService.GetAllResourcesAsync(eventId, pageNumber, pageSize));

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{eventId}/public-resources")]
        //public async Task<ActionResult<PagedResult<Resource>>> GetAllPublicResources(string eventId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        //    => Ok(await _eventService.GetAllPublicResourcesAsync(eventId, pageNumber, pageSize));
        public async Task<ActionResult<PagedResult<Resource>>> GetAllPublicResources(string eventId)
            => Ok(await _eventService.GetAllPublicResourcesAsync(eventId));

        [Authorize(Roles = "Admin")]
        [HttpGet("{eventId}/resource/{resourceId}")]
        public async Task<ActionResult<Resource>> GetResourceById(string eventId, string resourceId)
        {
            var resource = await _eventService.GetResourceByIdAsync(eventId, resourceId);
            return resource == null ? NotFound() : Ok(resource);
        }

        [Authorize(Roles = "User")]
        [HttpPut("{eventId}/resources/{resourceId}/reserve")]
        public async Task<IActionResult> IncrementResourceReserved(string eventId, string resourceId, [FromBody] int quantity)
        {
            var success = await _eventService.IncrementResourceReservedAsync(eventId, resourceId, quantity);
            if (!success) return NotFound();

            return Ok(new { message = "Resource reserved updated successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{eventId}/resource")]
        public async Task<IActionResult> UpsertResource(string eventId, [FromBody] Resource resource)
            => Ok(await _eventService.UpsertResourceAsync(eventId, resource));

        [Authorize(Roles = "Admin")]
        [HttpDelete("{eventId}/resource/{resourceId}")]
        public async Task<IActionResult> DeleteResource(string eventId, string resourceId)
        {
            var deleted = await _eventService.DeleteResourceAsync(eventId, resourceId);
            return deleted ? Ok() : NotFound();
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{eventId}/programs")]
        public async Task<ActionResult<List<EventProgram>>> GetPrograms(string eventId)
        {
            var result = await _eventService.GetProgramsAsync(eventId);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{eventId}/program")]
        public async Task<ActionResult<List<EventProgram>>> AddProgram(string eventId, [FromBody] EventProgram program)
        {
            var result = await _eventService.AddProgramAsync(eventId, program);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{eventId}/program/{programId}")]
        public async Task<IActionResult> UpdateProgram(string eventId, string programId, [FromBody] EventProgram program)
        {
            var success = await _eventService.UpdateProgramAsync(eventId, programId, program);
            return success ? NoContent() : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{eventId}/program/{programId}")]
        public async Task<IActionResult> DeleteProgram(string eventId, string programId)
        {
            var success = await _eventService.DeleteProgramAsync(eventId, programId);
            return success ? Ok() : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{eventId}/publish")]
        public async Task<IActionResult> PublishEvent(string eventId)
        {
            var updated = await _eventService.PublishEventAsync(eventId);
            return updated ? Ok() : NotFound();
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{eventId}/tickets")]
        public async Task<ActionResult<List<EventTicket>>> GetAllTickets(string eventId)
        {
            var tickets = await _eventService.GetAllTicketsAsync(eventId);
            return tickets == null ? NotFound("Događaj sa datim ID-jem ne postoji.") : Ok(tickets);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{eventId}/tickets")]
        public async Task<IActionResult> AddTicket(string eventId, [FromBody] EventTicket newTicket)
        {
            if (newTicket == null)
                return BadRequest("Telo zahteva ne sme biti prazno.");

            try
            {
                var added = await _eventService.AddTicketAsync(eventId, newTicket);
                return added ? Ok(newTicket) : NotFound("Događaj sa datim ID-jem ne postoji.");
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 Conflict
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPut("{eventId}/tickets/{ticketId}")]
        public async Task<IActionResult> UpdateTicket(string eventId, string ticketId, [FromBody] EventTicket updatedTicket)
        {
            if (updatedTicket == null || updatedTicket.Id != ticketId)
                return BadRequest("Nevalidan zahtev.");

            var success = await _eventService.UpdateTicketAsync(eventId, ticketId, updatedTicket);
            return success ? NoContent() : NotFound("Tiket ili događaj nije pronađen.");
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{eventId}/tickets/{ticketId}")]
        public async Task<IActionResult> DeleteTicket(string eventId, string ticketId)
        {
            var deleted = await _eventService.DeleteTicketAsync(eventId, ticketId);
            return deleted ? Ok() : NotFound("Tiket ili događaj nije pronađen.");
        }
    }
}