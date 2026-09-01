using System.Reflection;
using FieldJournal.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FieldJournal.Tests;

/// <summary>
/// The rest of the suite runs on EF Core InMemory, which never applies
/// migrations. That leaves the relational startup path untested: a migration
/// missing its [Migration] attribute is invisible to EF, so Migrate() creates
/// an empty __EFMigrationsHistory, applies nothing, and every query then fails
/// with 42P01 relation "Users" does not exist. These tests need no database.
/// </summary>
public class MigrationsTests
{
    private static readonly Assembly ApiAssembly = typeof(AppDbContext).Assembly;

    [Fact]
    public void ApiAssembly_ContainsAtLeastOneDiscoverableMigration()
    {
        var migrations = ApiAssembly.GetTypes()
            .Where(t => typeof(Migration).IsAssignableFrom(t)
                        && t.GetCustomAttribute<MigrationAttribute>() is not null)
            .ToList();

        Assert.NotEmpty(migrations);
    }

    [Fact]
    public void EveryMigration_IsAttributedToTheAppDbContext()
    {
        var migrations = ApiAssembly.GetTypes()
            .Where(t => typeof(Migration).IsAssignableFrom(t) && !t.IsAbstract)
            .ToList();

        Assert.NotEmpty(migrations);

        foreach (var migration in migrations)
        {
            Assert.NotNull(migration.GetCustomAttribute<MigrationAttribute>());

            var dbContext = migration.GetCustomAttribute<DbContextAttribute>();
            Assert.NotNull(dbContext);
            Assert.Equal(typeof(AppDbContext), dbContext!.ContextType);
        }
    }
}
