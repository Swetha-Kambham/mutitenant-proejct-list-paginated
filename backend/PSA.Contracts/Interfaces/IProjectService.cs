using PSA.Contracts.DTOs;

namespace PSA.Contracts.Interfaces;

public interface IProjectService
{
    Task<PaginatedResponseDto<ProjectDto>> GetProjectsAsync(
        string tenantSlug,
        int userId,
        int page,
        int pageSize,
        string? searchTerm = null);
}
