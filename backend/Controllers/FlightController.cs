using LabTest.Services;
using AutoMapper;
using LabTest.backend.Models.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LabTest.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightController : ControllerBase
    {
        private readonly FlightServices flightServices;
        private readonly IMapper mapper;
        public FlightController(FlightServices flightServices, IMapper mapper)
        {
            this.flightServices = flightServices;
            this.mapper = mapper;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllFlights([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            var flights = await flightServices.GetFlightsAsync(pageNumber, pageSize);
            return Ok(flights);
        }

        [HttpPost("bulk-upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> BulkUploadFlights(IFormFile? file)
        {
            BulkUploadResult result = await flightServices.BulkUploadAsync(file);
            if (!result.AnyInserted)
            {
                return BadRequest(result.Errors.Count > 0 ? string.Join("; ", result.Errors) : "No valid flight records found.");
            }
            return Ok(result);
        }
    }
}
