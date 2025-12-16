using Microsoft.EntityFrameworkCore;
using PSA.DAL.DbContext;
using PSA.DAL.Entities;

namespace PSA.DAL.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly TenantDbContext _context;

    public ProjectRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Project> Projects, int TotalCount)> GetProjectsForUserAsync(
        int userId,
        int page,
        int pageSize,
        string? searchTerm = null)
    {
        // Query projects that the user has access to (row-level security)
        var query = _context.Projects
            .Where(p => _context.ProjectAccesses
                .Any(pa => pa.UserId == userId && pa.ProjectId == p.Id));

        // Apply search filter if provided (case-insensitive)
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{searchTerm}%"));
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply pagination (LIMIT/OFFSET)
        var projects = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (projects, totalCount);
    }
}
