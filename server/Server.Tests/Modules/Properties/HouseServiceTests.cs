using Moq;
using Server.Modules.Media.Application.Services;
using Server.Modules.Properties.Contracts.Houses.Services;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;
using Server.SharedKernel.Media;
using Server.Tests.Common;

namespace Server.Tests.Modules.Properties;

public sealed class HouseServiceTests
{
    [Fact]
    public async Task UnlinkPhotoAsync_WhenLinkRemoved_CleansUpOrphanedPhoto()
    {
        await using var db = new TestDb();

        var houseId = Guid.NewGuid();
        var photoId = Guid.NewGuid();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Strict);

        var photoCleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        photoCleanup.Setup(s => s.CleanupOrphanedPhotosAsync(new[] { photoId }, default))
            .ReturnsAsync(Array.Empty<Guid>());

        var houseRepo = new Mock<IHouseRepository>(MockBehavior.Strict);
        houseRepo.Setup(r => r.GetForUpdateAsync(houseId, default))
            .ReturnsAsync(new House { Id = houseId, Name = "H", HouseTypeId = Guid.NewGuid(), AddressId = Guid.NewGuid(), CreatedAtUtc = DateTime.UtcNow });

        var refRepo = new Mock<IHouseReferenceDataRepository>(MockBehavior.Strict);

        var housePhotoRepo = new Mock<IHousePhotoRepository>(MockBehavior.Strict);
        housePhotoRepo.Setup(r => r.RemoveLinkAsync(houseId, photoId, default)).ReturnsAsync(true);
        housePhotoRepo.Setup(r => r.SaveChangesAsync(default)).Returns(Task.CompletedTask);

        var service = new HouseService(
            db.Context,
            photoCommit.Object,
            photoCleanup.Object,
            houseRepo.Object,
            refRepo.Object,
            housePhotoRepo.Object);

        var ok = await service.UnlinkPhotoAsync(houseId, photoId);

        Assert.True(ok);
        housePhotoRepo.Verify(r => r.RemoveLinkAsync(houseId, photoId, default), Times.Once);
        housePhotoRepo.Verify(r => r.SaveChangesAsync(default), Times.Once);
        photoCleanup.Verify(s => s.CleanupOrphanedPhotosAsync(new[] { photoId }, default), Times.Once);
    }
}
