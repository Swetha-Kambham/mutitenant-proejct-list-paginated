using PSA.DAL.Entities;

namespace PSA.DAL.Repositories;

public interface IProjectRepository
{
    Task<(List<Project> Projects, int TotalCount)> GetProjectsForUserAsync(
        int userId,
        int page,
        int pageSize,
        string? searchTerm = null);
}
