using PSA.Contracts.DTOs;
using PSA.Contracts.Interfaces;
using PSA.DAL.DbContext;
using PSA.DAL.Repositories;

namespace PSA.Services;

public class ProjectService : IProjectService
{
    private readonly TenantDbContext _db;

    public ProjectService(TenantDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponseDto<ProjectDto>> GetProjectsAsync(
        string tenantSlug,
        int userId,
        int page,
        int pageSize,
        string? searchTerm = null)
    {
        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        // 🔑 Apply tenant schema PER REQUEST
        _db.SetTenantSchema(tenantSlug);

        var projectRepository = new ProjectRepository(_db);

        // Row-level security enforced inside repository
        var (projects, totalCount) =
            await projectRepository.GetProjectsForUserAsync(
                userId,
                page,
                pageSize,
                searchTerm
            );

        var projectDtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        return new PaginatedResponseDto<ProjectDto>
        {
            Data = projectDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
