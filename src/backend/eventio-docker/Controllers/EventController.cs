[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly IEventService _service;
    public EventController(IEventService service) => _service = service;

    [HttpGet] public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _service.GetByIdAsync(id));
    [HttpPost] public async Task<IActionResult> Create(Event ev) { await _service.CreateAsync(ev); return Ok(ev); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(string id, Event ev) { await _service.UpdateAsync(id, ev); return NoContent(); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(string id) { await _service.DeleteAsync(id); return NoContent(); }
}