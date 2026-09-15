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
            HeaderEn = "Property for sale and rent",
            ContentEn =
                "Apartments, villas, offices and shops in Tehran and beyond — current prices, full details and viewings on request. Find the right property to buy or to rent.",
            Header = "املاک برای خرید و اجاره",
            Content = "آپارتمان، ویلا، دفتر اداری و مغازه در تهران و شهرهای دیگر — با قیمت روز، مشخصات کامل و امکان بازدید. ملک مناسب خود را برای خرید یا اجاره پیدا کنید."
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
