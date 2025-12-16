using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PSA.Contracts.DTOs;
using PSA.Contracts.Interfaces;
using PSA.DAL.DbContext;
using PSA.DAL.Repositories;

namespace PSA.Services;

public class AuthService : IAuthService
{
    private readonly TenantDbContext _db;

    public AuthService(TenantDbContext db)
    {
        _db = db;
    }

    public async Task<LoginResponseDto> ValidateLoginAsync(LoginRequestDto request)
    {
        try
        {
            // Resolve tenant schema from company key
            var tenantSlug = ResolveTenantSchema(request.CompanyKey);
            if (string.IsNullOrEmpty(tenantSlug))
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid company key"
                };
            }

            // 🔑 Apply tenant schema PER REQUEST
            _db.SetTenantSchema(tenantSlug);

            var userRepository = new UserRepository(_db);

            // Get user by username
            var user = await userRepository.GetByUsernameAsync(request.Username);
            if (user == null)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

            // Verify password (MD5 hash for demo only)
            var hashedPassword = ComputeMD5Hash(request.Password);
            if (user.Password != hashedPassword)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

            return new LoginResponseDto
            {
                Success = true,
                UserId = user.Id,
                Username = user.Username,
                TenantSlug = tenantSlug,
                Role = user.Role,
                Message = "Login successful"
            };
        }
        catch (Exception ex)
        {
            return new LoginResponseDto
            {
                Success = false,
                Message = $"Login failed: {ex.Message}"
            };
        }
    }

    private string ResolveTenantSchema(string companyKey)
    {
        return companyKey.ToLower() switch
        {
            "t1" => "tenant_t1",
            "t2" => "tenant_t2",
            _ => string.Empty
        };
    }

    private string ComputeMD5Hash(string input)
    {
        using var md5 = MD5.Create();
        var inputBytes = Encoding.UTF8.GetBytes(input);
        var hashBytes = md5.ComputeHash(inputBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
