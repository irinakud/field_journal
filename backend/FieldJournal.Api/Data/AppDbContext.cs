using Microsoft.EntityFrameworkCore;
using FieldJournal.Api.Models;

namespace FieldJournal.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Observation> Observations => Set<Observation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.Username).HasMaxLength(50);
            e.Property(u => u.Email).HasMaxLength(200);
        });

        modelBuilder.Entity<Observation>(e =>
        {
            e.Property(o => o.Species).HasMaxLength(200);
            e.Property(o => o.Location).HasMaxLength(300);
            e.HasOne(o => o.User)
             .WithMany(u => u.Observations)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
