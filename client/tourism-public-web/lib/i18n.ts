type Translations = {
  discover: string;
  headingTours: string;
  toursDescription: string;
  noTours: string;
  allTrips: string;
  previous: string;
  next: string;
  pageOf: (current: number, max: number) => string;
  stayInspired: string;
  headingHouses: string;
  housesDescription: string;
  noHouses: string;
  allHouses: string;
  navHouses: string;
  navTours: string;
  siteTitle: string;
  seeDetails: string;
  copyright: string;
};

const EN: Translations = {
  discover: "Discover",
  headingTours: "Find your perfect getaway",
  toursDescription:
    "Handpicked journeys designed to inspire — from peaceful escapes to action-packed adventures. Explore curated tours that match your travel style and make memories that last a lifetime.",
  noTours: "No tours available right now.",
  allTrips: "All trips",
  previous: "Previous",
  next: "Next",
  pageOf: (current, max) => `Page ${current} of ${max}`,
  stayInspired: "Stay inspired",
  headingHouses: "Homes for every getaway",
  housesDescription:
    "Comfortable, handpicked homes — from cozy city apartments to peaceful countryside retreats. Choose a stay that fits your trip and feels like home.",
  noHouses: "No houses available at the moment.",
  allHouses: "All houses",
  navHouses: "Houses",
  navTours: "Tours",
  siteTitle: "Tourism Platform",
  seeDetails: "See more details",
  copyright: "© 2024 Tourism Platform. All rights reserved.",
};

const FA: Translations = {
  discover: "کشف کنید",
  headingTours: "کامل‌ترین سفر برای شما",
  toursDescription:
    "سفرهای دستچین‌شده برای الهام‌بخشیدن — از فرارهای آرام تا تجربه‌های پرهیجان. تورهای منتخب را کشف کنید و خاطراتی بسازید که ماندگار شود.",
  noTours: "در حال حاضر توری موجود نیست.",
  allTrips: "همه تورها",
  previous: "قبلی",
  next: "بعدی",
  pageOf: (current, max) => `صفحه ${current} از ${max}`,
  stayInspired: "در الهام بمانید",
  headingHouses: "خانه‌هایی برای هر سفر",
  housesDescription:
    "خانه‌های راحت و دستچین‌شده — از آپارتمان‌های دنج شهری تا پناهگاه‌های آرام در طبیعت. اقامتی متناسب با سفر خود انتخاب کنید که احساس خانه را بدهد.",
  noHouses: "در حال حاضر خانه‌ای موجود نیست.",
  allHouses: "همه خانه‌ها",
  navHouses: "خانه‌ها",
  navTours: "تورها",
  siteTitle: "پلتفرم گردشگری",
  seeDetails: "مشاهده جزئیات بیشتر",
  copyright: "© 2024 Tourism Platform. تمامی حقوق محفوظ است.",
};

export function i18n(locale?: string): Translations {
  return locale === "fa" ? FA : EN;
}

export default i18n;
