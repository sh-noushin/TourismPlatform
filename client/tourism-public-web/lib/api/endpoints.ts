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

export const apiEndpoints = {
  categories: categoryEndpoints,
  houses: houseEndpoints,
  tours: tourEndpoints,
} as const;
