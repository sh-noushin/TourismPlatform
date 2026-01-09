using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Defaults;

internal static class PublicWebDefaults
{
    public static IReadOnlyCollection<PublicSection> Sections => new[]
    {
        new PublicSection("en", "hero")
        {
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
        new PublicSection("en", "tours")
        {
            Tagline = "DISCOVER",
            Heading = "Find your perfect getaway",
            Body = "Handpicked journeys designed to inspire — from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style and make memories that last a lifetime.",
            SortOrder = 1,
            IsActive = true
        },
        new PublicSection("en", "houses")
        {
            Tagline = "DISCOVER",
            Heading = "Homes for every getaway",
            Body = "Comfortable, handpicked homes — from cozy city apartments to peaceful countryside retreats. Choose a stay that fits your trip and feels like home.",
            SortOrder = 2,
            IsActive = true
        },
        new PublicSection("en", "about")
        {
            Tagline = "TRAVEL THE WORLD",
            Heading = "Plan with our travel agency",
            Body = "Discover tailored itineraries, curated homes, and seamless journeys. Our team handles the details so you can focus on the experience.",
            ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
            PrimaryCtaText = "Learn More",
            PrimaryCtaUrl = "/learn-more",
            SecondaryCtaText = "Contact Us",
            SecondaryCtaUrl = "mailto:hello@parker.travel",
            SortOrder = 3,
            IsActive = true
        },
        new PublicSection("fa", "hero")
        {
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
        new PublicSection("fa", "tours")
        {
            Tagline = "کشف کنید",
            Heading = "کامل‌ترین سفر برای شما",
            Body = "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود.",
            SortOrder = 1,
            IsActive = true
        },
        new PublicSection("fa", "houses")
        {
            Tagline = "کشف کنید",
            Heading = "خانه‌هایی برای هر سفر",
            Body = "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد.",
            SortOrder = 2,
            IsActive = true
        },
        new PublicSection("fa", "about")
        {
            Tagline = "سفر به دور دنیا",
            Heading = "با آژانس ما برنامه‌ریزی کنید",
            Body = "برنامه‌های سفر سفارشی، خانه‌های منتخب و سفرهای بدون دردسر را کشف کنید. تیم ما جزئیات را مدیریت می‌کند تا شما روی تجربه تمرکز کنید.",
            ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
            PrimaryCtaText = "بیشتر بدانید",
            PrimaryCtaUrl = "/learn-more",
            SecondaryCtaText = "تماس بگیرید",
            SecondaryCtaUrl = "mailto:hello@parker.travel",
            SortOrder = 3,
            IsActive = true
        }
    };

    public static IReadOnlyCollection<PublicCallToAction> CallToActions => new[]
    {
        new PublicCallToAction("en", "learn-more")
        {
            Text = "Learn More",
            Url = "/learn-more",
            SortOrder = 0,
            IsActive = true
        },
        new PublicCallToAction("en", "contact-us")
        {
            Text = "Contact Us",
            Url = "mailto:hello@parker.travel",
            SortOrder = 1,
            IsActive = true
        },
        new PublicCallToAction("fa", "learn-more")
        {
            Text = "بیشتر بدانید",
            Url = "/learn-more",
            SortOrder = 0,
            IsActive = true
        },
        new PublicCallToAction("fa", "contact-us")
        {
            Text = "تماس بگیرید",
            Url = "mailto:hello@parker.travel",
            SortOrder = 1,
            IsActive = true
        }
    };

    public static IReadOnlyCollection<PublicContactInfo> ContactInfos => new[]
    {
        new PublicContactInfo("en")
        {
            Title = "Contact Us",
            Description = "Our travel specialists are ready to help you plan every detail.",
            Email = "hello@parker.travel",
            Phone = "+1 (555) 123-4567",
            Address = "123 Explorer Lane, Adventure City",
            IsActive = true
        },
        new PublicContactInfo("fa")
        {
            Title = "تماس با ما",
            Description = "مشاوران سفر ما آماده هستند تا جزئیات را برای شما برنامه‌ریزی کنند.",
            Email = "hello@parker.travel",
            Phone = "+98 21 1234 5678",
            Address = "خیابان اکتشاف ۱۲۳، شهر ماجراجویی",
            IsActive = true
        }
    };

    public static IReadOnlyCollection<PublicLearnMorePage> LearnMorePages => new[]
    {
        new PublicLearnMorePage("en")
        {
            Title = "This is how we travel",
            Heading = "Learn more about our planning process",
            Body = "We design tailored journeys with curated homes and concierge-level support so you can focus on the experience.",
            ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
            PrimaryButtonText = "Book now",
            PrimaryButtonUrl = "/contact",
            IsActive = true
        },
        new PublicLearnMorePage("fa")
        {
            Title = "این همان سفر ماست",
            Heading = "با روند برنامه‌ریزی ما بیشتر آشنا شوید",
            Body = "ما سفرهای سفارشی با خانه‌های منتخب و پشتیبانی سطح کانسییرج طراحی می‌کنیم تا شما فقط روی تجربه تمرکز کنید.",
            ImageUrl = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
            PrimaryButtonText = "رزرو کنید",
            PrimaryButtonUrl = "/contact",
            IsActive = true
        }
    };
}
