using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Defaults;

internal static class PublicWebDefaults
{
    public static IReadOnlyCollection<PublicSection> Sections => new[]
    {
        new PublicSection("en", "tours", PublicSectionType.Tours)
        {
            Header = "Find your perfect getaway",
            Content = "Handpicked journeys designed to inspire — from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style and make memories that last a lifetime."
        },
        new PublicSection("en", "houses", PublicSectionType.Houses)
        {
            Header = "Homes for every getaway",
            Content = "Comfortable, handpicked homes — from cozy city apartments to peaceful countryside retreats. Choose a stay that fits your trip and feels like home."
        },
        new PublicSection("en", "infos", PublicSectionType.Infos)
        {
            Header = "Plan with our travel agency",
            Content = "Discover tailored itineraries, curated homes, and seamless journeys. Our team handles the details so you can focus on the experience."
        },
        new PublicSection("fa", "tours", PublicSectionType.Tours)
        {
            Header = "کامل‌ترین سفر برای شما",
            Content = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود."
        },
        new PublicSection("fa", "houses", PublicSectionType.Houses)
        {
            Header = "خانه‌هایی برای هر سفر",
            Content = "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد."
        },
        new PublicSection("fa", "infos", PublicSectionType.Infos)
        {
            Header = "با آژانس ما برنامه‌ریزی کنید",
            Content = "برنامه‌های سفر سفارشی، خانه‌های منتخب و سفرهای بدون دردسر را کشف کنید. تیم ما جزئیات را مدیریت می‌کند تا شما روی تجربه تمرکز کنید."
        }
    };
}
