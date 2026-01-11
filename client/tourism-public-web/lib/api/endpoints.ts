const categoryEndpoints = {

  houseTypes: "/api/house-types",
  tourCategories: "/api/tour-categories",
};

const houseEndpoints = {
  list: "/api/houses",
  detail: (id: string) => `/api/houses/${id}`,
};

const tourEndpoints = {
  list: "/api/tours",
  detail: (id: string) => `/api/tours/${id}`,
};

const referenceEndpoints = {
  countries: "/api/reference/countries",
  currencies: "/api/reference/currencies",
};

const publicPageEndpoints = {
  sections: "/api/public-page/sections",
  section: (id: string) => `/api/public-page/sections/${id}`,
};

export const apiEndpoints = {
  categories: categoryEndpoints,
  houses: houseEndpoints,
  tours: tourEndpoints,
  reference: referenceEndpoints,
  publicPage: publicPageEndpoints,
} as const;
