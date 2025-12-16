using PSA.DAL.Entities;

namespace PSA.DAL.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
}
