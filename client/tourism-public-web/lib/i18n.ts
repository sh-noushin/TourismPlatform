import type { TourSort } from "@/lib/filters/tours";
import type { HouseSort } from "@/lib/filters/houses";

type SortLabels<T extends string> = Record<T, string>;

type FiltersTranslationDefinition = {
  title: string;
  toursSubtitle: string;
  housesSubtitle: string;
  buttonLabel: string;
  drawerTitle: string;
  applyButton: string;
  resetButton: string;
  destination: {
    label: string;
    helper: string;
    placeholder: string;
  };
  dateFromLabel: string;
  dateToLabel: string;
  location: {
    label: string;
    helper: string;
    placeholder: string;
  };
  country: {
    label: string;
    allLabel: string;
  };
  price: {
    minLabel: string;
    maxLabel: string;
    anyLabel: string;
  };
  duration: {
    minLabel: string;
    maxLabel: string;
    minPlaceholder: string;
    maxPlaceholder: string;
  };
  roomsMinLabel: string;
  areaMinLabel: string;
  tourCategory: {
    label: string;
    allLabel: string;
  };
  houseType: {
    label: string;
    allLabel: string;
  };
};

export type FiltersTranslation = FiltersTranslationDefinition;

type SortTranslation = {
  label: string;
  tours: SortLabels<TourSort>;
  houses: SortLabels<HouseSort>;
};

type ResultsTranslation = {
  toursHeader: (count: number) => string;
  toursEmpty: string;
  housesResultsLabel: (count: number) => string;
  housesRangeLabel: (start: number, end: number, total: number) => string;
  housesEmptyTitle: string;
  housesEmptyDescription: string;
};

type CardTranslation = {
  photos: (count: number) => string;
  noPhoto: string;
  viewSchedules: string;
};

export type Translations = {
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
  filters: FiltersTranslationDefinition;
  sort: SortTranslation;
  results: ResultsTranslation;
  cards: CardTranslation;
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
  filters: {
    title: "Filters",
    toursSubtitle: "Refine your journey",
    housesSubtitle: "Refine your search",
    buttonLabel: "Filters",
    drawerTitle: "Filters",
    applyButton: "Apply filters",
    resetButton: "Reset",
    destination: {
      label: "Destination",
      helper: "City, region, or tour name",
      placeholder: "Anywhere",
    },
    dateFromLabel: "From",
    dateToLabel: "To",
    location: {
      label: "Location",
      helper: "City, region, or country",
      placeholder: "Anywhere",
    },
    country: {
      label: "Country",
      allLabel: "All countries",
    },
    price: {
      minLabel: "Price min",
      maxLabel: "Price max",
      anyLabel: "Any",
    },
    duration: {
      minLabel: "Duration min (days)",
      maxLabel: "Duration max (days)",
      minPlaceholder: "1",
      maxPlaceholder: "Any",
    },
    roomsMinLabel: "Rooms min",
    areaMinLabel: "Area min (m²)",
    tourCategory: {
      label: "Tour category",
      allLabel: "All categories",
    },
    houseType: {
      label: "House type",
      allLabel: "All types",
    },
  },
  sort: {
    label: "Sort",
    tours: {
      nameAsc: "Name (A → Z)",
      nameDesc: "Name (Z → A)",
      categoryAsc: "Category (A → Z)",
      categoryDesc: "Category (Z → A)",
    },
    houses: {
      nameAsc: "Name (A → Z)",
      nameDesc: "Name (Z → A)",
    },
  },
  results: {
    toursHeader: (count) => `${count} ${count === 1 ? "Tour" : "Tours"} Found`,
    toursEmpty: "No tours found matching your criteria.",
    housesResultsLabel: (count) => `${count} results`,
    housesRangeLabel: (start, end, total) => `Showing ${start}-${end} of ${total} homes`,
    housesEmptyTitle: "No homes found",
    housesEmptyDescription: "Adjust your filters to discover more accommodations.",
  },
  cards: {
    photos: (count) => `${count} photos`,
    noPhoto: "No photo yet",
    viewSchedules: "View schedules",
  },
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
  filters: {
    title: "فیلترها",
    toursSubtitle: "سفر خود را دقیق‌تر تنظیم کنید",
    housesSubtitle: "جستجوی خود را دقیق‌تر تنظیم کنید",
    buttonLabel: "فیلترها",
    drawerTitle: "فیلترها",
    applyButton: "اعمال فیلترها",
    resetButton: "بازنشانی",
    destination: {
      label: "مقصد",
      helper: "شهر، منطقه یا نام تور",
      placeholder: "هر جا",
    },
    dateFromLabel: "از",
    dateToLabel: "تا",
    location: {
      label: "مکان",
      helper: "شهر، منطقه یا کشور",
      placeholder: "هر جا",
    },
    country: {
      label: "کشور",
      allLabel: "همه کشورها",
    },
    price: {
      minLabel: "حداقل قیمت",
      maxLabel: "حداکثر قیمت",
      anyLabel: "هر مبلغ",
    },
    duration: {
      minLabel: "حداقل مدت (روز)",
      maxLabel: "حداکثر مدت (روز)",
      minPlaceholder: "1",
      maxPlaceholder: "هر مقدار",
    },
    roomsMinLabel: "حداقل اتاق",
    areaMinLabel: "حداقل مساحت (متر مربع)",
    tourCategory: {
      label: "دسته‌بندی تور",
      allLabel: "همه دسته‌بندی‌ها",
    },
    houseType: {
      label: "نوع خانه",
      allLabel: "همه انواع",
    },
  },
  sort: {
    label: "مرتب‌سازی",
    tours: {
      nameAsc: "نام (الف → ی)",
      nameDesc: "نام (ی → الف)",
      categoryAsc: "دسته‌بندی (الف → ی)",
      categoryDesc: "دسته‌بندی (ی → الف)",
    },
    houses: {
      nameAsc: "نام (الف → ی)",
      nameDesc: "نام (ی → الف)",
    },
  },
  results: {
    toursHeader: (count) =>
      count === 1 ? "یک تور یافت شد" : `${count} تور یافت شد`,
    toursEmpty: "هیچ تور مطابق با معیارهای شما یافت نشد.",
    housesResultsLabel: (count) => `${count} نتیجه`,
    housesRangeLabel: (start, end, total) => `${start}-${end} از ${total} خانه نمایش داده شده`,
    housesEmptyTitle: "خانه‌ای یافت نشد",
    housesEmptyDescription: "فیلترها را تنظیم کنید تا گزینه‌های بیشتری ببینید.",
  },
  cards: {
    photos: (count) => `${count} عکس`,
    noPhoto: "هنوز عکسی اضافه نشده",
    viewSchedules: "مشاهده برنامه‌ها",
  },
};

export function i18n(locale?: string): Translations {
  return locale === "fa" ? FA : EN;
}

export default i18n;
