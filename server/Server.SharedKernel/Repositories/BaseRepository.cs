using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Server.SharedKernel.Repositories;

public abstract class BaseRepository<TEntity> : IBaseRepository<TEntity>
    where TEntity : class
{
    protected BaseRepository(DbContext dbContext)
    {
        DbContext = dbContext;
    }

    protected DbContext DbContext { get; }

    protected DbSet<TEntity> Set => DbContext.Set<TEntity>();

    public virtual IQueryable<TEntity> Query() => Set;

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        => await Set.AsNoTracking().ToListAsync(cancellationToken);

    public virtual Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Set.FindAsync(new object[] { id }, cancellationToken).AsTask();

    public virtual async Task<IReadOnlyList<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        => await Set.AsNoTracking().Where(predicate).ToListAsync(cancellationToken);

    public virtual Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        DbContext.Add(entity);
        return Task.FromResult(entity);
    }

    public virtual Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        DbContext.Update(entity);
        return Task.CompletedTask;
    }

    public virtual Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        DbContext.Remove(entity);
        return Task.CompletedTask;
    }

    public virtual Task<int> CountAsync(CancellationToken cancellationToken = default)
        => Set.CountAsync(cancellationToken);

    public virtual Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => DbContext.SaveChangesAsync(cancellationToken);
}
