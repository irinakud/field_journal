using System.Net;
using System.Net.Http.Json;
using FieldJournal.Api.DTOs;

namespace FieldJournal.Tests;

public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        factory.EnsureDbCreated();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ValidData_ReturnsToken()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"tuser_{Guid.NewGuid():N}",
            email = $"test_{Guid.NewGuid()}@example.com",
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.NotEmpty(auth.Token);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        var email = $"dup_{Guid.NewGuid()}@example.com";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { username = $"u1_{Guid.NewGuid():N}", email, password = "Password123!" });
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { username = $"u2_{Guid.NewGuid():N}", email, password = "Password123!" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var email = $"login_{Guid.NewGuid()}@example.com";
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"loginuser_{Guid.NewGuid():N}",
            email,
            password = "Password123!"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { email, password = "Password123!" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth?.Token);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        var email = $"wrong_{Guid.NewGuid()}@example.com";
        await _client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"wronguser_{Guid.NewGuid():N}",
            email,
            password = "Password123!"
        });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { email, password = "WrongPassword!" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
