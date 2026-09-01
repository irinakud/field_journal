using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FieldJournal.Api.Data;

namespace FieldJournal.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "TestDb_" + Guid.NewGuid();

    public TestWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("Jwt__Key", "test-secret-key-with-at-least-thirty-two-characters");
        Environment.SetEnvironmentVariable("Jwt__Issuer", "FieldJournalApi");
        Environment.SetEnvironmentVariable("Jwt__Audience", "FieldJournalClient");
        Environment.SetEnvironmentVariable("Cors__AllowedOrigins__0", "http://localhost:5173");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-secret-key-with-at-least-thirty-two-characters",
                ["Jwt:Issuer"] = "FieldJournalApi",
                ["Jwt:Audience"] = "FieldJournalClient",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173"
            });
        });
        builder.ConfigureServices(services =>
        {
            // Remove DbContextOptions<AppDbContext> AND the internal
            // IDbContextOptionsConfiguration<AppDbContext> that EF Core 9+ adds.
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.Name.StartsWith("IDbContextOptionsConfiguration") &&
                     d.ServiceType.GetGenericArguments().FirstOrDefault() == typeof(AppDbContext)))
                .ToList();

            foreach (var d in toRemove)
                services.Remove(d);

            services.AddDbContext<AppDbContext>(opts =>
                opts.UseInMemoryDatabase(_dbName));
        });
    }

    public void EnsureDbCreated()
    {
        using var scope = Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
    }
}
