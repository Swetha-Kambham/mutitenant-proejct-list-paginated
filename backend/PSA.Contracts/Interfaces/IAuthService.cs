using PSA.Contracts.DTOs;

namespace PSA.Contracts.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> ValidateLoginAsync(LoginRequestDto request);
}
