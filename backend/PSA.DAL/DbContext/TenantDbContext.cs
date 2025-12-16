using Microsoft.EntityFrameworkCore;
using PSA.DAL.Entities;

namespace PSA.DAL.DbContext;

public class TenantDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    // Tenant schema is set per request (NOT via constructor)
    private string? _tenantSchema;

    public TenantDbContext(DbContextOptions<TenantDbContext> options)
        : base(options)
    {
    }

    // Called at runtime by repository/service
    public void SetTenantSchema(string tenantSchema)
    {
        _tenantSchema = tenantSchema;
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectAccess> ProjectAccesses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply tenant schema dynamically
        if (!string.IsNullOrWhiteSpace(_tenantSchema))
        {
            modelBuilder.HasDefaultSchema(_tenantSchema);
        }

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<ProjectAccess>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ProjectId, e.UserId }).IsUnique();

            entity.HasOne(pa => pa.Project)
                .WithMany(p => p.ProjectAccesses)
                .HasForeignKey(pa => pa.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pa => pa.User)
                .WithMany(u => u.ProjectAccesses)
                .HasForeignKey(pa => pa.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
