using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Defaults;

internal static class PublicWebDefaults
{
    public static IReadOnlyCollection<PublicSection> Sections => new[]
    {
        new PublicSection("tours", PublicSectionType.Tours)
        {
            Header = "کامل‌ترین سفر برای شما",
            Content = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود."
        },
        new PublicSection("houses", PublicSectionType.Houses)
        {
            Header = "خانه‌هایی برای هر سفر",
            Content = "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد."
        },
        new PublicSection("infos", PublicSectionType.Infos)
        {
            Header = "با آژانس ما برنامه‌ریزی کنید",
            Content = "برنامه‌های سفر سفارشی، خانه‌های منتخب و سفرهای بدون دردسر را کشف کنید. تیم ما جزئیات را مدیریت می‌کند تا شما روی تجربه تمرکز کنید."
        }
    };
}
