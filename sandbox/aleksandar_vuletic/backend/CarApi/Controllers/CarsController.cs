using Microsoft.AspNetCore.Mvc;
using CarApi.Models;
using CarApi.Services;

namespace CarApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarsController : ControllerBase
    {
        private readonly CarService _carService;

        public CarsController(CarService carService)
        {
            _carService = carService;
        }

        // GET: api/cars
        [HttpGet]
        public async Task<ActionResult<List<Car>>> GetAll()
        {
            var cars = await _carService.GetAsync();
            return Ok(cars);
        }

        // GET: api/cars/{id}
        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Car>> GetById(string id)
        {
            var car = await _carService.GetAsync(id);
            if (car == null)
                return NotFound();

            return Ok(car);
        }

        // POST: api/cars
        [HttpPost]
        public async Task<ActionResult<Car>> Create(Car car)
        {
            await _carService.CreateAsync(car);
            return CreatedAtAction(nameof(GetById), new { id = car.Id }, car);
        }

        // PUT: api/cars/{id}
        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Car updatedCar)
        {
            var existingCar = await _carService.GetAsync(id);
            if (existingCar == null)
                return NotFound();

            updatedCar.Id = id;
            await _carService.UpdateAsync(id, updatedCar);

            return NoContent();
        }

        // DELETE: api/cars/{id}
        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existingCar = await _carService.GetAsync(id);
            if (existingCar == null)
                return NotFound();

            await _carService.DeleteAsync(id);
            return NoContent();
        }
    }
}