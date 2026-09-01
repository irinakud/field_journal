using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FieldJournal.Api.Data;
using FieldJournal.Api.DTOs;
using FieldJournal.Api.Models;

namespace FieldJournal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ObservationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ObservationsController(AppDbContext db)
    {
        _db = db;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IEnumerable<ObservationResponse>> GetAll()
    {
        return await _db.Observations
            .Include(o => o.User)
            .OrderByDescending(o => o.ObservedAt)
            .Select(o => ToResponse(o))
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var obs = await _db.Observations.Include(o => o.User)
                           .FirstOrDefaultAsync(o => o.Id == id);
        if (obs is null) return NotFound();
        return Ok(ToResponse(obs));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateObservationRequest req)
    {
        var obs = new Observation
        {
            Species = req.Species,
            Location = req.Location,
            Notes = req.Notes,
            PhotoUrl = req.PhotoUrl,
            Latitude = req.Latitude,
            Longitude = req.Longitude,
            ObservedAt = req.ObservedAt ?? DateTime.UtcNow,
            UserId = CurrentUserId
        };

        _db.Observations.Add(obs);
        await _db.SaveChangesAsync();

        await _db.Entry(obs).Reference(o => o.User).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = obs.Id }, ToResponse(obs));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateObservationRequest req)
    {
        var obs = await _db.Observations.FindAsync(id);
        if (obs is null) return NotFound();
        if (obs.UserId != CurrentUserId) return Forbid();

        obs.Species = req.Species;
        obs.Location = req.Location;
        obs.Notes = req.Notes;
        obs.PhotoUrl = req.PhotoUrl;
        obs.Latitude = req.Latitude;
        obs.Longitude = req.Longitude;
        obs.ObservedAt = req.ObservedAt ?? obs.ObservedAt;

        await _db.SaveChangesAsync();
        await _db.Entry(obs).Reference(o => o.User).LoadAsync();
        return Ok(ToResponse(obs));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var obs = await _db.Observations.FindAsync(id);
        if (obs is null) return NotFound();
        if (obs.UserId != CurrentUserId) return Forbid();

        _db.Observations.Remove(obs);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ObservationResponse ToResponse(Observation o) =>
        new(o.Id, o.Species, o.Location, o.Notes, o.PhotoUrl,
            o.Latitude, o.Longitude, o.ObservedAt, o.CreatedAt,
            o.UserId, o.User.Username);
}
