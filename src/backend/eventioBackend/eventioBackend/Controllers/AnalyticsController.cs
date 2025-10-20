using eventioBackend.Domain.Interfaces;
using eventioBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eventioBackend.Controllers
{
    // AnalyticsController.cs
    [ApiController]
    [Route("api/analytics/organizer")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IOrganizerAnalyticsService _analyticsService;

        public AnalyticsController(IOrganizerAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{organizerId}/overview")]
        public async Task<ActionResult<OrganizerAnalyticsDto>> GetOverview(string organizerId, [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var result = await _analyticsService.GetOrganizerAnalyticsAsync(organizerId, from, to);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }

}
