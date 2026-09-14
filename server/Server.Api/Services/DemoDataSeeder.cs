using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Identity.Domain.Permissions;
using Server.Modules.Identity.Domain.Users;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Tours.Domain.Tours;
using Server.SharedKernel.Auth;

namespace Server.Api.Services;

/// <summary>
/// Fills every admin screen with plausible demo records so the dashboard can be
/// used, demonstrated and screenshotted without hand-entering a row per page.
///
/// Two rules shape the whole class:
///   * <b>Idempotent.</b> Every row gets a Guid derived from a stable key, so a
///     restart re-finds what it wrote instead of duplicating it. The API runs
///     this on every boot, and compose briefly runs two instances during a
///     deploy -- the same situation that once produced duplicate rate rows.
///   * <b>Additive.</b> Nothing is updated or deleted. Edits made in the UI
///     survive the next restart; only genuinely missing rows are inserted.
///
/// Exchange rates are deliberately absent: those come from navasan.net through
/// <see cref="ExchangeRateSyncService"/>, and invented numbers next to live ones
/// are worse than an empty chart.
/// </summary>
public sealed class DemoDataSeeder
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<DemoDataSeeder> _logger;

    public DemoDataSeeder(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        ILogger<DemoDataSeeder> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await SeedPermissionDefinitionsAsync(cancellationToken);
        await SeedHouseTypesAsync(cancellationToken);
        await SeedTourCategoriesAsync(cancellationToken);
        await SeedHousesAsync(cancellationToken);
        await SeedToursAsync(cancellationToken);
        await BackfillTranslationsAsync(cancellationToken);
        var demoUserIds = await SeedDemoUsersAsync(cancellationToken);
        await SeedBookingsAsync(demoUserIds, cancellationToken);
        await SeedExchangeOrdersAsync(demoUserIds, cancellationToken);
    }

    // -------------------------------------------------------------------------
    // Permissions
    //
    // The catalogue of permission codes, so the permissions screen lists the
    // policies the API actually enforces. Grants (RolePermission/UserPermission)
    // are left alone on purpose: handing a role a permission is an authorisation
    // decision, not demo data.
    // -------------------------------------------------------------------------
    private static readonly HouseSeed[] HouseSeeds =
    {
        new("house-elahieh", "آپارتمان لوکس الهیه", "Luxury apartment in Elahieh", "185 m2 with excellent natural light, private parking and a grand lobby in the best part of Elahieh.", "آپارتمان ۱۸۵ متری با نورگیر عالی، پارکینگ اختصاصی و لابی مجلل در بهترین نقطه الهیه.",
            HouseListingType.Buy, 42_000_000_000m, "IRR", "آپارتمان", "ایران", "تهران", "تهران", "خیابان فرشته، کوچه بیدار، پلاک ۱۲", "1965874321"),
        new("house-zaferanieh", "آپارتمان زعفرانیه", "Zaferanieh apartment", "120 m2, two bedrooms, renovated, suited to family living.", "واحد ۱۲۰ متری دو خوابه، بازسازی‌شده، مناسب سکونت خانواده.",
            HouseListingType.Rent, 480_000_000m, "IRR", "آپارتمان", "ایران", "تهران", "تهران", "زعفرانیه، خیابان مقدس اردبیلی، پلاک ۴۵", "1987654321"),
        new("house-lavasan", "ویلا باغ لواسان", "Garden villa in Lavasan", "A duplex villa with 800 m2 of garden, an indoor pool and mountain views.", "ویلا دوبلکس با ۸۰۰ متر باغ، استخر سرپوشیده و چشم‌انداز کوهستان.",
            HouseListingType.Buy, 68_000_000_000m, "IRR", "ویلا", "ایران", "لواسان", "تهران", "لواسان بزرگ، بلوار امام خمینی، کوچه نسترن", "3345678912"),
        new("house-ramsar", "ویلا ساحلی رامسر", "Beachfront villa in Ramsar", "Direct beach access, ideal for short lets and holidays.", "ویلا با دسترسی مستقیم به ساحل، مناسب اجاره کوتاه‌مدت و تعطیلات.",
            HouseListingType.Rent, 95_000_000m, "IRR", "ویلا", "ایران", "رامسر", "مازندران", "جاده ساحلی، شهرک دریاکنار، واحد ۷", "4691234567"),
        new("house-isfahan-office", "دفتر اداری چهارباغ", "Chaharbagh office", "90 m2 in an office building with a lift and parking, suited to a startup.", "دفتر ۹۰ متری در ساختمان اداری با آسانسور و پارکینگ، مناسب استارتاپ.",
            HouseListingType.Rent, 180_000_000m, "IRR", "دفتر اداری", "ایران", "اصفهان", "اصفهان", "خیابان چهارباغ بالا، ساختمان نگین، طبقه ۴", "8173456219"),
        new("house-shiraz-shop", "مغازه بازار وکیل", "Shop in the Vakil bazaar", "35 m2 in a prime commercial position with an established customer base.", "مغازه ۳۵ متری با موقعیت تجاری عالی و مشتری ثابت.",
            HouseListingType.Buy, 12_500_000_000m, "IRR", "مغازه", "ایران", "شیراز", "فارس", "بازار وکیل، راسته زرگرها، پلاک ۲۲", "7134567891"),
        new("house-kish", "سوئیت ساحلی کیش", "Beachside suite on Kish", "A furnished one-bedroom suite, 200 m from Marjan beach, available daily.", "سوئیت مبله یک خوابه، ۲۰۰ متر تا ساحل مرجان، تحویل روزانه.",
            HouseListingType.Rent, 38_000_000m, "IRR", "سوئیت", "ایران", "کیش", "هرمزگان", "شهرک صدف، مجتمع مروارید، بلوک ب", "7941567832"),
        new("house-mashhad", "آپارتمان نزدیک حرم", "Apartment near the shrine", "75 m2, a ten-minute walk from the holy shrine, suited to pilgrims.", "واحد ۷۵ متری در فاصله ۱۰ دقیقه پیاده تا حرم مطهر، مناسب زائران.",
            HouseListingType.Rent, 42_000_000m, "IRR", "آپارتمان", "ایران", "مشهد", "خراسان رضوی", "خیابان امام رضا، کوچه ۱۴، پلاک ۹", "9134567218"),
        new("house-istanbul", "آپارتمان شیشلی استانبول", "Sisli apartment, Istanbul", "A 2+1 unit in Sisli near the metro, good for investment or living.", "واحد ۲+۱ در منطقه شیشلی، نزدیک مترو، مناسب سرمایه‌گذاری و اقامت.",
            HouseListingType.Buy, 265_000m, "USD", "آپارتمان", "ترکیه", "استانبول", "مرمره", "Şişli, Halaskargazi Cd. No: 84", "34371"),
        new("house-dubai", "آپارتمان مارینا دبی", "Dubai Marina apartment", "One bedroom with marina views, full leisure facilities and a shared pool.", "واحد یک خوابه با ویو مارینا، امکانات کامل رفاهی و استخر مشترک.",
            HouseListingType.Rent, 9_500m, "AED", "آپارتمان", "امارات", "دبی", "دبی", "Dubai Marina, Marina Gate 2, Unit 1104", "00000")
    };

    private static readonly TourSeed[] TourSeeds =
    {
        new("tour-masuleh", "ماسوله و ییلاقات گیلان", "Masuleh & the Gilan highlands", "Three days walking the Hyrcanian forest, staying in a village house and eating Gilani food.", "سه روز پیاده‌روی در جنگل‌های هیرکانی، اقامت در خانه محلی و غذای گیلانی.",
            18_500_000m, "IRR", "IR", "طبیعت‌گردی", [12, 40, 68], 3, 24),
        new("tour-persepolis", "تخت جمشید و پاسارگاد", "Persepolis & Pasargadae", "A specialist tour with an archaeologist guide through the Achaemenid capital and the tomb of Cyrus.", "گشت تخصصی با راهنمای باستان‌شناس در پایتخت هخامنشیان و آرامگاه کوروش.",
            24_900_000m, "IRR", "IR", "تاریخی و فرهنگی", [18, 52], 2, 30),
        new("tour-isfahan", "اصفهان، نصف جهان", "Isfahan, half the world", "Naqsh-e Jahan, Si-o-se-pol, the Chehel Sotoun palace and the Qeysarieh bazaar in three days.", "نقش جهان، سی‌وسه‌پل، کاخ چهلستون و بازار قیصریه در یک سفر سه‌روزه.",
            21_500_000m, "IRR", "IR", "تاریخی و فرهنگی", [9, 30, 61], 3, 28),
        new("tour-qeshm", "قشم و جزیره هنگام", "Qeshm & Hengam Island", "The Valley of the Stars, the Hara mangrove forest and dolphin watching off Hengam.", "دره ستاره‌ها، جنگل حرا و تماشای دلفین‌ها در آب‌های هنگام.",
            32_000_000m, "IRR", "IR", "ساحلی", [22, 50], 4, 20),
        new("tour-kish", "کیش، تعطیلات ساحلی", "Kish, a beach holiday", "Four nights at a beachfront hotel with a city tour and water sports.", "اقامت چهار شب در هتل ساحلی با گشت شهری و تفریحات آبی.",
            29_800_000m, "IRR", "IR", "ساحلی", [7, 35, 70], 4, 32),
        new("tour-mashhad", "زیارت مشهد مقدس", "Pilgrimage to Mashhad", "A four-day pilgrimage with accommodation near the shrine and a full visiting programme.", "سفر زیارتی چهار روزه با اقامت نزدیک حرم و برنامه زیارتی کامل.",
            15_900_000m, "IRR", "IR", "زیارتی", [5, 26, 47], 4, 40),
        new("tour-damavand", "صعود به قله دماوند", "Climbing Mount Damavand", "Five days on the southern route with a technical leader and group equipment.", "برنامه پنج‌روزه صعود از جبهه جنوبی با سرپرست فنی و تجهیزات گروهی.",
            38_500_000m, "IRR", "IR", "ماجراجویی", [28, 63], 5, 12),
        new("tour-lut", "کویر لوت و کلوت‌های شهداد", "Lut desert & the Shahdad kaluts", "A night under the desert sky and a journey out to the kaluts of Shahdad.", "شب‌مانی در کویر، تماشای آسمان پرستاره و سفر به کلوت‌های شهداد.",
            26_400_000m, "IRR", "IR", "ماجراجویی", [16, 44], 3, 18),
        new("tour-istanbul", "استانبول، شهر دو قاره", "Istanbul, city of two continents", "Four nights with Hagia Sophia, Sultanahmet and a Bosphorus cruise.", "چهار شب اقامت با گشت ایاصوفیه، سلطان‌احمد و سفر دریایی بسفر.",
            690m, "USD", "TR", "تورهای خارجی", [20, 48, 76], 5, 26),
        new("tour-dubai", "دبی، خرید و تفریح", "Dubai, shopping & leisure", "Burj Khalifa, a desert safari and the shopping malls across four days.", "برج خلیفه، سافاری کویر و مراکز خرید در یک سفر چهار روزه.",
            2_450m, "AED", "AE", "تورهای خارجی", [14, 42], 4, 22)
    };

    private static readonly (string Fa, string En)[] HouseTypeSeeds = new (string Fa, string En)[]
    {
        ("آپارتمان", "Apartment"),
        ("ویلا", "Villa"),
        ("دفتر اداری", "Office"),
        ("مغازه", "Shop"),
        ("زمین", "Land"),
        ("سوئیت", "Suite"),
    };

    private static readonly (string Fa, string En)[] TourCategorySeeds = new (string Fa, string En)[]
    {
        ("طبیعت‌گردی", "Nature & outdoors"),
        ("تاریخی و فرهنگی", "History & culture"),
        ("ساحلی", "Beach & islands"),
        ("زیارتی", "Pilgrimage"),
        ("ماجراجویی", "Adventure"),
        ("تورهای خارجی", "International"),
    };

    private async Task SeedPermissionDefinitionsAsync(CancellationToken cancellationToken)
    {
        var catalogue = new (string Code, string Description)[]
        {
            (PolicyNames.HousesManage, "مدیریت املاک: ایجاد، ویرایش و حذف"),
            (PolicyNames.ToursManage, "مدیریت تورها: ایجاد، ویرایش و زمان‌بندی"),
            (PolicyNames.ExchangeManage, "مدیریت صرافی: هم‌گام‌سازی نرخ‌ها و سفارش‌ها"),
            (PolicyNames.UsersManage, "مدیریت کاربران و نقش‌ها"),
            (PolicyNames.MediaManage, "مدیریت تصاویر و فایل‌ها")
        };

        var existing = await _dbContext.Set<PermissionDefinition>()
            .Select(p => p.Code)
            .ToListAsync(cancellationToken);

        var missing = catalogue
            .Where(item => !existing.Contains(item.Code, StringComparer.OrdinalIgnoreCase))
            .Select(item => new PermissionDefinition
            {
                Code = item.Code,
                Description = item.Description,
                IsEnabled = true
            })
            .ToList();

        if (missing.Count == 0)
        {
            return;
        }

        // PermissionDefinition.Id has a protected setter (it derives from Entity),
        // so these cannot carry a derived Guid -- the unique index on Code is what
        // keeps the insert idempotent.
        _dbContext.AddRange(missing);
        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} permission definitions.", missing.Count);
    }

    // -------------------------------------------------------------------------
    // Reference lists behind the house and tour forms
    // -------------------------------------------------------------------------
    private async Task SeedHouseTypesAsync(CancellationToken cancellationToken)
    {
        var names = HouseTypeSeeds;

        var existingIds = await _dbContext.Set<HouseType>().Select(t => t.Id).ToListAsync(cancellationToken);
        var missing = names
            .Select(name => new HouseType { Id = DemoId("house-type", name.Fa), Name = name.Fa, NameEn = name.En })
            .Where(type => !existingIds.Contains(type.Id))
            .ToList();

        if (missing.Count == 0)
        {
            return;
        }

        _dbContext.AddRange(missing);
        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} house types.", missing.Count);
    }

    private async Task SeedTourCategoriesAsync(CancellationToken cancellationToken)
    {
        var names = TourCategorySeeds;

        var existingIds = await _dbContext.Set<TourCategory>().Select(c => c.Id).ToListAsync(cancellationToken);
        var missing = names
            .Select(name => new TourCategory { Id = DemoId("tour-category", name.Fa), Name = name.Fa, NameEn = name.En })
            .Where(category => !existingIds.Contains(category.Id))
            .ToList();

        if (missing.Count == 0)
        {
            return;
        }

        _dbContext.AddRange(missing);
        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} tour categories.", missing.Count);
    }

    // -------------------------------------------------------------------------
    // Houses -- each one carries its own Location and Address, since both are
    // owned rows rather than shared lookups.
    // -------------------------------------------------------------------------
    private sealed record HouseSeed(
        string Key,
        string Name,
        string NameEn,
        string DescriptionEn,
        string Description,
        HouseListingType ListingType,
        decimal Price,
        string Currency,
        string TypeName,
        string Country,
        string City,
        string? Region,
        string Line1,
        string PostalCode);

    private async Task SeedHousesAsync(CancellationToken cancellationToken)
    {
        var seeds = HouseSeeds;

        var existingHouseIds = await _dbContext.Set<House>().Select(h => h.Id).ToListAsync(cancellationToken);
        var missing = seeds.Where(seed => !existingHouseIds.Contains(DemoId("house", seed.Key))).ToList();

        if (missing.Count == 0)
        {
            return;
        }

        // Both sides of the clock are useful in a demo list: some rows should look
        // long-established and some recent, so sorting by date is not a flat wall.
        var createdAt = DateTime.UtcNow.AddDays(-90);

        // Locations carry a unique index on (Country, City, Region): they are a
        // shared lookup, not a row per house. Two Tehran listings must therefore
        // point at one location, and an existing one always wins over a new row.
        var locations = await _dbContext.Set<Location>()
            .ToDictionaryAsync(LocationKey, l => l.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);

        foreach (var seed in missing)
        {
            var locationKey = $"{seed.Country}|{seed.City}|{seed.Region}";
            if (!locations.TryGetValue(locationKey, out var locationId))
            {
                locationId = DemoId("location", locationKey);
                _dbContext.Add(new Location
                {
                    Id = locationId,
                    Country = seed.Country,
                    City = seed.City,
                    Region = seed.Region
                });
                locations[locationKey] = locationId;
            }

            var address = new Address
            {
                Id = DemoId("address", seed.Key),
                LocationId = locationId,
                Line1 = seed.Line1,
                PostalCode = seed.PostalCode
            };

            var house = new House
            {
                Id = DemoId("house", seed.Key),
                Name = seed.Name,
                Description = seed.Description,
                NameEn = seed.NameEn,
                DescriptionEn = seed.DescriptionEn,
                ListingType = seed.ListingType,
                Price = seed.Price,
                Currency = seed.Currency,
                HouseTypeId = DemoId("house-type", seed.TypeName),
                AddressId = address.Id,
                CreatedAtUtc = createdAt
            };

            _dbContext.AddRange(address, house);
            createdAt = createdAt.AddDays(8);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} houses.", missing.Count);
    }

    // -------------------------------------------------------------------------
    // Tours and their departure dates
    // -------------------------------------------------------------------------
    private sealed record TourSeed(
        string Key,
        string Name,
        string NameEn,
        string DescriptionEn,
        string Description,
        decimal Price,
        string Currency,
        string CountryCode,
        string CategoryName,
        int[] DepartureOffsetsInDays,
        int DurationInDays,
        int Capacity);

    private async Task SeedToursAsync(CancellationToken cancellationToken)
    {
        var seeds = TourSeeds;

        var existingTourIds = await _dbContext.Set<Tour>().Select(t => t.Id).ToListAsync(cancellationToken);
        var missing = seeds.Where(seed => !existingTourIds.Contains(DemoId("tour", seed.Key))).ToList();

        if (missing.Count == 0)
        {
            return;
        }

        var now = DateTime.UtcNow;
        var createdAt = now.AddDays(-60);

        foreach (var seed in missing)
        {
            var tour = new Tour
            {
                Id = DemoId("tour", seed.Key),
                Name = seed.Name,
                Description = seed.Description,
                NameEn = seed.NameEn,
                DescriptionEn = seed.DescriptionEn,
                Price = seed.Price,
                Currency = seed.Currency,
                CountryCode = seed.CountryCode,
                TourCategoryId = DemoId("tour-category", seed.CategoryName),
                CreatedAtUtc = createdAt
            };

            _dbContext.Add(tour);

            foreach (var offset in seed.DepartureOffsetsInDays)
            {
                // Departures are pinned to 06:00 UTC rather than "now plus N", so a
                // re-seed on a different clock still produces the same tidy times.
                var start = now.Date.AddDays(offset).AddHours(6);

                _dbContext.Add(new TourSchedule
                {
                    Id = DemoId("schedule", $"{seed.Key}:{offset}"),
                    TourId = tour.Id,
                    StartAtUtc = start,
                    EndAtUtc = start.AddDays(seed.DurationInDays),
                    Capacity = seed.Capacity,
                    CreatedAtUtc = createdAt
                });
            }

            createdAt = createdAt.AddDays(5);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} tours.", missing.Count);
    }

    // -------------------------------------------------------------------------
    // Demo users -- so the users screen is not a single superadmin row, and so
    // bookings and exchange orders have someone to belong to.
    // -------------------------------------------------------------------------
    private sealed record UserSeed(string UserName, string Email, string Role);

    private async Task<IReadOnlyList<Guid>> SeedDemoUsersAsync(CancellationToken cancellationToken)
    {
        var seeds = new UserSeed[]
        {
            new("reza.karimi", "reza.karimi@tourism.local", "Admin"),
            new("sara.ahmadi", "sara.ahmadi@tourism.local", "Admin"),
            new("mohammad.rezaei", "mohammad.rezaei@tourism.local", "User"),
            new("niloofar.sadeghi", "niloofar.sadeghi@tourism.local", "User"),
            new("hossein.moradi", "hossein.moradi@tourism.local", "User")
        };

        var ids = new List<Guid>();

        foreach (var seed in seeds)
        {
            var user = await _userManager.FindByEmailAsync(seed.Email);
            if (user is not null)
            {
                ids.Add(user.Id);
                continue;
            }

            user = new ApplicationUser
            {
                UserName = seed.UserName,
                Email = seed.Email,
                EmailConfirmed = true
            };

            // One shared password across the demo accounts. This seeder only runs
            // where Seed:DemoData is switched on, which is a developer's machine
            // or a demo deployment -- never a real one.
            var result = await _userManager.CreateAsync(user, "Demo!12345");
            if (!result.Succeeded)
            {
                _logger.LogWarning(
                    "Skipped demo user {UserName}: {Errors}",
                    seed.UserName,
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                continue;
            }

            await _userManager.AddToRoleAsync(user, seed.Role);
            ids.Add(user.Id);
        }

        return ids;
    }

    // -------------------------------------------------------------------------
    // Bookings against the seeded departures
    // -------------------------------------------------------------------------
    private async Task SeedBookingsAsync(IReadOnlyList<Guid> userIds, CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return;
        }

        var schedules = await _dbContext.Set<TourSchedule>()
            .OrderBy(s => s.StartAtUtc)
            .Take(12)
            .Select(s => new { s.Id, s.TourId })
            .ToListAsync(cancellationToken);

        if (schedules.Count == 0)
        {
            return;
        }

        var existingIds = await _dbContext.Set<Booking>().Select(b => b.Id).ToListAsync(cancellationToken);
        var seatPattern = new[] { 2, 1, 4, 2, 3, 1, 2, 5 };
        var created = 0;

        for (var i = 0; i < schedules.Count; i++)
        {
            var schedule = schedules[i];
            var userId = userIds[i % userIds.Count];
            var id = DemoId("booking", $"{schedule.Id}:{userId}");

            if (existingIds.Contains(id))
            {
                continue;
            }

            _dbContext.Add(new Booking
            {
                Id = id,
                TourId = schedule.TourId,
                TourScheduleId = schedule.Id,
                UserId = userId,
                Seats = seatPattern[i % seatPattern.Length],
                CreatedAtUtc = DateTime.UtcNow.AddDays(-(i * 3) - 1)
            });
            created++;
        }

        if (created == 0)
        {
            return;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} bookings.", created);
    }

    // -------------------------------------------------------------------------
    // Exchange orders
    //
    // Rates on the orders are the ones agreed at the time of the order, so unlike
    // the rate feed these are legitimately historical numbers rather than
    // invented market data.
    // -------------------------------------------------------------------------
    private async Task SeedExchangeOrdersAsync(IReadOnlyList<Guid> userIds, CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return;
        }

        var currencies = await _dbContext.Set<Currency>()
            .ToDictionaryAsync(c => c.Code, c => c.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var seeds = new (string Key, string Base, string Quote, decimal Amount, decimal Rate, ExchangeOrderStatus Status, int DaysAgo)[]
        {
            ("order-usd-1", "USD", "IRR", 1_200m, 1_015_000m, ExchangeOrderStatus.Completed, 26),
            ("order-eur-1", "EUR", "IRR", 800m, 1_128_000m, ExchangeOrderStatus.Completed, 21),
            ("order-aed-1", "AED", "IRR", 5_000m, 278_500m, ExchangeOrderStatus.Completed, 17),
            ("order-usd-2", "USD", "IRR", 3_400m, 1_032_000m, ExchangeOrderStatus.Pending, 9),
            ("order-try-1", "TRY", "IRR", 40_000m, 24_800m, ExchangeOrderStatus.Cancelled, 7),
            ("order-gbp-1", "GBP", "IRR", 650m, 1_306_000m, ExchangeOrderStatus.Pending, 4),
            ("order-aed-2", "AED", "IRR", 12_000m, 281_000m, ExchangeOrderStatus.Pending, 2),
            ("order-eur-2", "EUR", "IRR", 2_100m, 1_141_000m, ExchangeOrderStatus.Completed, 1)
        };

        var existingIds = await _dbContext.Set<ExchangeOrder>().Select(o => o.Id).ToListAsync(cancellationToken);
        var created = 0;

        for (var i = 0; i < seeds.Length; i++)
        {
            var seed = seeds[i];
            var id = DemoId("exchange-order", seed.Key);

            if (existingIds.Contains(id))
            {
                continue;
            }

            // A currency the reference seeder does not know about would fail the FK;
            // skipping keeps one bad row from aborting the whole seed.
            if (!currencies.TryGetValue(seed.Base, out var baseId) ||
                !currencies.TryGetValue(seed.Quote, out var quoteId))
            {
                _logger.LogWarning("Skipped demo order {Key}: unknown currency pair.", seed.Key);
                continue;
            }

            var createdAt = DateTime.UtcNow.AddDays(-seed.DaysAgo);

            _dbContext.Add(new ExchangeOrder
            {
                Id = id,
                UserId = userIds[i % userIds.Count],
                BaseCurrencyId = baseId,
                QuoteCurrencyId = quoteId,
                BaseAmount = seed.Amount,
                Rate = seed.Rate,
                QuoteAmount = seed.Amount * seed.Rate,
                Status = seed.Status,
                CreatedAtUtc = createdAt,
                UpdatedAtUtc = seed.Status == ExchangeOrderStatus.Pending ? null : createdAt.AddHours(3)
            });
            created++;
        }

        if (created == 0)
        {
            return;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Count} exchange orders.", created);
    }

    /// <summary>
    /// The natural key behind the unique index on Locations. Region is nullable,
    /// so it normalises to an empty segment rather than dropping out.
    /// </summary>
    private static string LocationKey(Location location) =>
        $"{location.Country}|{location.City}|{location.Region}";

    /// <summary>
    /// Derives a stable Guid from a namespaced key, the same trick
    /// <see cref="ReferenceDataSeeder"/> uses for currency and country ids. The
    /// namespace prefix keeps a house and its address from colliding on a shared
    /// key, and MD5 is a hash here, not a security choice.
    /// </summary>
    private static Guid DemoId(string prefix, string key)
    {
        var hash = MD5.HashData(Encoding.UTF8.GetBytes($"demo:{prefix}:{key}"));
        return new Guid(hash);
    }

    // -------------------------------------------------------------------------
    // Translations for rows that already exist
    //
    // The seeders above only insert what is missing, so a database seeded
    // before the English columns existed would keep its Persian-only rows
    // forever. This fills in the blanks and only the blanks: an English name
    // typed in the dashboard is never overwritten.
    // -------------------------------------------------------------------------
    private async Task BackfillTranslationsAsync(CancellationToken cancellationToken)
    {
        var updated = 0;

        var tourText = TourSeeds.ToDictionary(t => DemoId("tour", t.Key), t => (t.NameEn, t.DescriptionEn));
        var tours = await _dbContext.Set<Tour>()
            .Where(t => t.NameEn == null)
            .ToListAsync(cancellationToken);

        foreach (var tour in tours)
        {
            if (!tourText.TryGetValue(tour.Id, out var text)) continue;
            tour.NameEn = text.NameEn;
            tour.DescriptionEn ??= text.DescriptionEn;
            updated++;
        }

        var houseText = HouseSeeds.ToDictionary(h => DemoId("house", h.Key), h => (h.NameEn, h.DescriptionEn));
        var houses = await _dbContext.Set<House>()
            .Where(h => h.NameEn == null)
            .ToListAsync(cancellationToken);

        foreach (var house in houses)
        {
            if (!houseText.TryGetValue(house.Id, out var text)) continue;
            house.NameEn = text.NameEn;
            house.DescriptionEn ??= text.DescriptionEn;
            updated++;
        }

        var categoryText = TourCategorySeeds.ToDictionary(c => DemoId("tour-category", c.Fa), c => c.En);
        foreach (var category in await _dbContext.Set<TourCategory>().Where(c => c.NameEn == null).ToListAsync(cancellationToken))
        {
            if (!categoryText.TryGetValue(category.Id, out var nameEn)) continue;
            category.NameEn = nameEn;
            updated++;
        }

        var typeText = HouseTypeSeeds.ToDictionary(t => DemoId("house-type", t.Fa), t => t.En);
        foreach (var houseType in await _dbContext.Set<HouseType>().Where(t => t.NameEn == null).ToListAsync(cancellationToken))
        {
            if (!typeText.TryGetValue(houseType.Id, out var nameEn)) continue;
            houseType.NameEn = nameEn;
            updated++;
        }

        if (updated == 0)
        {
            return;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Backfilled English text on {Count} rows.", updated);
    }
}
