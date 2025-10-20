[ApiController]
[Route("api/[controller]")]
public class ResourceController : ControllerBase
{
    private readonly IResourceService _service;
    public ResourceController(IResourceService service) => _service = service;

    [HttpGet] public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _service.GetByIdAsync(id));
    [HttpPost] public async Task<IActionResult> Create(Resource r) { await _service.CreateAsync(r); return Ok(r); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(string id, Resource r) { await _service.UpdateAsync(id, r); return NoContent(); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(string id) { await _service.DeleteAsync(id); return NoContent(); }
}