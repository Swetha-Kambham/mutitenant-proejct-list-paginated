using Microsoft.EntityFrameworkCore;
using PSA.DAL.DbContext;
using PSA.DAL.Entities;

namespace PSA.DAL.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TenantDbContext _context;

    public UserRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}
