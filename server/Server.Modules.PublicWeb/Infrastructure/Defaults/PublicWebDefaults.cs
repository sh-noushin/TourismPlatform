using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Defaults;

internal static class PublicWebDefaults
{
    public static IReadOnlyCollection<PublicSection> Sections => new[]
    {
        new PublicSection("tours", PublicSectionType.Tours)
        {
            HeaderEn = "Find your perfect getaway",
            ContentEn =
                "Handpicked journeys designed to inspire -- from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style.",
            Header = "کامل‌ترین سفر برای شما",
            Content = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود."
        },
        new PublicSection("houses", PublicSectionType.Houses)
        {
            HeaderEn = "Homes for every getaway",
            ContentEn =
                "Comfortable, handpicked homes -- from cosy city apartments to quiet retreats in the countryside. Choose a stay that fits your trip.",
            Header = "خانه‌هایی برای هر سفر",
            Content = "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد."
        },
        new PublicSection("infos", PublicSectionType.Infos)
        {
            HeaderEn = "Plan with our agency",
            ContentEn =
                "Tailored itineraries, handpicked homes and journeys without the hassle. Our team handles the details so you can focus on the experience.",
            Header = "با آژانس ما برنامه‌ریزی کنید",
            Content = "برنامه‌های سفر سفارشی، خانه‌های منتخب و سفرهای بدون دردسر را کشف کنید. تیم ما جزئیات را مدیریت می‌کند تا شما روی تجربه تمرکز کنید."
        }
    };
}
