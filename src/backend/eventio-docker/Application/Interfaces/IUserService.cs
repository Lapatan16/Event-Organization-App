namespace Eventio.Application.Interfaces
{
    public interface IUserService
    {
        Task<User> AuthenticateAsync(string email, string password);
        Task RegisterAsync(User user, string password);
        Task<User> GetByIdAsync(string id);
    }
}