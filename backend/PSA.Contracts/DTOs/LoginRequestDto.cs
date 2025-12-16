namespace PSA.Contracts.DTOs;

public class LoginRequestDto
{
    public string CompanyKey { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
