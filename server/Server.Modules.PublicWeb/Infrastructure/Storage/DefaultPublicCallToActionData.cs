using System.Collections.Generic;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Storage;

internal static class DefaultPublicCallToActionData
{
    public static IReadOnlyCollection<PublicCallToAction> GetDefaults()
        => new[]
        {
            new PublicCallToAction
            {
                Id = "learn-more",
                Locale = "en",
                Text = "Learn More",
                Url = "/tours",
                SortOrder = 0,
                IsActive = true
            },
            new PublicCallToAction
            {
                Id = "contact-us",
                Locale = "en",
                Text = "Contact Us",
                Url = "mailto:hello@parker.travel",
                SortOrder = 1,
                IsActive = true
            },
            new PublicCallToAction
            {
                Id = "learn-more",
                Locale = "fa",
                Text = "بیشتر بدانید",
                Url = "/tours",
                SortOrder = 0,
                IsActive = true
            },
            new PublicCallToAction
            {
                Id = "contact-us",
                Locale = "fa",
                Text = "تماس بگیرید",
                Url = "mailto:hello@parker.travel",
                SortOrder = 1,
                IsActive = true
            }
        };
}
