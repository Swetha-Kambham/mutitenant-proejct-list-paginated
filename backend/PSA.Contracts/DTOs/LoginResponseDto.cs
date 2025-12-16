namespace PSA.Contracts.DTOs;

public class LoginResponseDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string TenantSlug { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Message { get; set; }
}
