using Microsoft.AspNetCore.Mvc;
using studenticrud.Models;
using studenticrud.Services;


namespace studenticrud.Controllers;

[ApiController]
[Route("api/studenti")]
public class studentiController : ControllerBase
{
    private readonly studentiService _service;

    public studentiController(studentiService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<List<studentiModel>> Get() => _service.Get();

    [HttpGet("{id}")]
    public ActionResult<studentiModel> Get(string id) => _service.Get(id);

    [HttpPost]
public ActionResult<studentiModel> Create(studentiModel item)
{
    var createdStudent = _service.Create(item);
    return CreatedAtAction(nameof(Get), new { id = createdStudent.Id }, createdStudent);
}

    [HttpPut("{id}")]
    public IActionResult Update(string id, studentiModel item)
    {
         try
    {
        _service.Update(id, item);
        return NoContent();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Greška prilikom ažuriranja: {ex.Message}");
    }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
{
    try
    {
        _service.Delete(id);
        return NoContent();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Greška prilikom brisanja: {ex.Message}");
    }
}
}
