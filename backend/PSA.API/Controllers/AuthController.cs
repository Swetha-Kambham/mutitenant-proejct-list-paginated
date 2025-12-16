using Microsoft.AspNetCore.Mvc;
using PSA.Contracts.DTOs;
using PSA.Contracts.Interfaces;

namespace PSA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Login endpoint - validates credentials and returns user info
    /// </summary>
    /// <param name="request">Login credentials with company key</param>
    /// <returns>User information if successful</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Login attempt for user: {Username}, company: {CompanyKey}",
            request.Username, request.CompanyKey);

        if (string.IsNullOrWhiteSpace(request.CompanyKey) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new LoginResponseDto
            {
                Success = false,
                Message = "Company key, username, and password are required"
            });
        }

        var result = await _authService.ValidateLoginAsync(request);

        if (!result.Success)
        {
            _logger.LogWarning("Login failed for user: {Username}", request.Username);
            return Ok(result); // Return 200 with success=false to avoid exposing user existence
        }

        _logger.LogInformation("Login successful for user: {Username}, tenant: {TenantSlug}",
            result.Username, result.TenantSlug);

        return Ok(result);
    }
}
