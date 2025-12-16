using Microsoft.AspNetCore.Mvc;
using PSA.Contracts.DTOs;
using PSA.Contracts.Interfaces;

namespace PSA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IProjectService projectService, ILogger<ProjectsController> logger)
    {
        _projectService = projectService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of projects with row-level security
    /// </summary>
    /// <param name="tenantSlug">Tenant schema identifier (e.g., tenant_t1)</param>
    /// <param name="userId">User ID for row-level security</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 10, max: 100)</param>
    /// <param name="search">Search term for project name (optional)</param>
    /// <returns>Paginated list of projects</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponseDto<ProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PaginatedResponseDto<ProjectDto>>> GetProjects(
        [FromQuery] string tenantSlug,
        [FromQuery] int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        _logger.LogInformation(
            "Getting projects for tenant: {TenantSlug}, user: {UserId}, page: {Page}, pageSize: {PageSize}, search: {Search}",
            tenantSlug, userId, page, pageSize, search);

        if (string.IsNullOrWhiteSpace(tenantSlug))
        {
            return BadRequest(new { error = "Tenant slug is required" });
        }

        if (userId <= 0)
        {
            return BadRequest(new { error = "Valid user ID is required" });
        }

        var result = await _projectService.GetProjectsAsync(
            tenantSlug,
            userId,
            page,
            pageSize,
            search);

        _logger.LogInformation(
            "Retrieved {Count} projects out of {TotalCount} for user {UserId}",
            result.Data.Count, result.TotalCount, userId);

        return Ok(result);
    }
}
