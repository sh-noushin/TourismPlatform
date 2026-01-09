using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Storage;

internal static class DefaultPublicSectionData
{
    public static IReadOnlyCollection<PublicSection> GetDefaults()
        => new[]
        {
            new PublicSection
            {
                Id = "hero",
                Locale = "en",
                Tagline = "DISCOVER",
                Heading = "Find your perfect getaway",
                Body = "Handpicked journeys designed to inspire — from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style and make memories that last a lifetime.",
                ImageUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
                PrimaryCtaText = "All trips",
                PrimaryCtaUrl = "/tours",
                SecondaryCtaText = "All houses",
                SecondaryCtaUrl = "/houses",
                SortOrder = 0,
                IsActive = true
            },
            new PublicSection
            {
                Id = "tours",
                Locale = "en",
                Tagline = "DISCOVER",
                Heading = "Find your perfect getaway",
                Body = "Handpicked journeys designed to inspire — from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style and make memories that last a lifetime.",
                SortOrder = 1,
                IsActive = true
            },
            new PublicSection
            {
                Id = "houses",
                Locale = "en",
                Tagline = "DISCOVER",
                Heading = "Homes for every getaway",
                Body = "Comfortable, handpicked homes — from cozy city apartments to peaceful countryside retreats. Choose a stay that fits your trip and feels like home.",
                SortOrder = 2,
                IsActive = true
            },
            new PublicSection
            {
                Id = "about",
                Locale = "en",
                Tagline = "TRAVEL THE WORLD",
                Heading = "Plan with our travel agency",
                Body = "Discover tailored itineraries, curated homes, and seamless journeys. Our team handles the details so you can focus on the experience.",
                ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
                PrimaryCtaText = "Learn More",
                PrimaryCtaUrl = "/tours",
                SecondaryCtaText = "Contact Us",
                SecondaryCtaUrl = "mailto:hello@parker.travel",
                SortOrder = 3,
                IsActive = true
            },
            new PublicSection
            {
                Id = "hero",
                Locale = "fa",
                Tagline = "کشف کنید",
                Heading = "کامل‌ترین سفر برای شما",
                Body = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود.",
                ImageUrl = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
                PrimaryCtaText = "همه تورها",
                PrimaryCtaUrl = "/tours",
                SecondaryCtaText = "همه خانه‌ها",
                SecondaryCtaUrl = "/houses",
                SortOrder = 0,
                IsActive = true
            },
            new PublicSection
            {
                Id = "tours",
                Locale = "fa",
                Tagline = "کشف کنید",
                Heading = "کامل‌ترین سفر برای شما",
                Body = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود.",
                SortOrder = 1,
                IsActive = true
            },
            new PublicSection
            {
                Id = "houses",
                Locale = "fa",
                Tagline = "کشف کنید",
                Heading = "خانه‌هایی برای هر سفر",
                Body = "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد.",
                SortOrder = 2,
                IsActive = true
            },
            new PublicSection
            {
                Id = "about",
                Locale = "fa",
                Tagline = "سفر به دور دنیا",
                Heading = "با آژانس ما برنامه‌ریزی کنید",
                Body = "برنامه‌های سفر سفارشی، خانه‌های منتخب و سفرهای بدون دردسر را کشف کنید. تیم ما جزئیات را مدیریت می‌کند تا شما روی تجربه تمرکز کنید.",
                ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
                PrimaryCtaText = "بیشتر بدانید",
                PrimaryCtaUrl = "/tours",
                SecondaryCtaText = "تماس بگیرید",
                SecondaryCtaUrl = "mailto:hello@parker.travel",
                SortOrder = 3,
                IsActive = true
            }
        };
}
