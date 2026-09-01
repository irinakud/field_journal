using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FieldJournal.Api.DTOs;

namespace FieldJournal.Tests;

public class ObservationsControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ObservationsControllerTests(TestWebApplicationFactory factory)
    {
        factory.EnsureDbCreated();
        _factory = factory;
    }

    private async Task<HttpClient> CreateAuthenticatedClient()
    {
        var client = _factory.CreateClient();
        var email = $"obs_{Guid.NewGuid()}@example.com";
        var resp = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"obsuser_{Guid.NewGuid():N}",
            email,
            password = "Password123!"
        });
        resp.EnsureSuccessStatusCode();
        var auth = await resp.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", auth!.Token);
        return client;
    }

    [Fact]
    public async Task GetAll_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/observations");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateObservation_Authenticated_ReturnsCreated()
    {
        var client = await CreateAuthenticatedClient();
        var response = await client.PostAsJsonAsync("/api/observations", new
        {
            species = "Robin",
            location = "Hyde Park",
            notes = "Spotted near the pond",
            photoUrl = (string?)null,
            latitude = 51.507,
            longitude = -0.165,
            observedAt = (DateTime?)null
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var obs = await response.Content.ReadFromJsonAsync<ObservationResponse>();
        Assert.NotNull(obs);
        Assert.Equal("Robin", obs.Species);
    }

    [Fact]
    public async Task GetAll_AfterCreate_ReturnsObservation()
    {
        var client = await CreateAuthenticatedClient();
        await client.PostAsJsonAsync("/api/observations", new
        {
            species = "Sparrow",
            location = "Central Park",
            notes = "Singing",
            photoUrl = (string?)null,
            latitude = (double?)null,
            longitude = (double?)null,
            observedAt = (DateTime?)null
        });

        var response = await client.GetAsync("/api/observations");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var list = await response.Content.ReadFromJsonAsync<ObservationResponse[]>();
        Assert.NotNull(list);
        Assert.Contains(list, o => o.Species == "Sparrow");
    }

    [Fact]
    public async Task DeleteObservation_OtherUser_ReturnsForbidden()
    {
        var client1 = await CreateAuthenticatedClient();
        var createResp = await client1.PostAsJsonAsync("/api/observations", new
        {
            species = "Owl",
            location = "Forest",
            notes = "Night observation",
            photoUrl = (string?)null,
            latitude = (double?)null,
            longitude = (double?)null,
            observedAt = (DateTime?)null
        });
        var obs = await createResp.Content.ReadFromJsonAsync<ObservationResponse>();

        var client2 = await CreateAuthenticatedClient();
        var deleteResp = await client2.DeleteAsync($"/api/observations/{obs!.Id}");
        Assert.Equal(HttpStatusCode.Forbidden, deleteResp.StatusCode);
    }
}
