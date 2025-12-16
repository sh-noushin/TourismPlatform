namespace Server.Modules.Properties.Domain.Repositories;

public interface IHouseRepository
{
    Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default);
    Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);
    Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
    void Add(House house);
    void Remove(House house);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
