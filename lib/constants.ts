export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'createdAt' | 'minVariantPriceAmount';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: 'Latest arrivals',
  slug: 'latest-desc',
  sortKey: 'createdAt',
  reverse: true
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'minVariantPriceAmount', reverse: false },
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'minVariantPriceAmount', reverse: true }
];

export type GenderFilterItem = {
  title: string;
  slug: string | null;
  genderKey: 'men' | 'women' | 'general';
};

export const defaultGender: GenderFilterItem = {
  title: 'All Genders',
  slug: 'general',
  genderKey: 'general'
};

export const genderFilters: GenderFilterItem[] = [
  defaultGender,
  { title: 'Men', slug: 'men', genderKey: 'men' },
  { title: 'Women', slug: 'women', genderKey: 'women' }
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';
export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2023-01/graphql.json';
