import ProductGrid from '@/components/grid/search-product-grid';
import { getProducts } from "@/actions/api/products";
import Grid from 'components/grid';
import { defaultSort, sorting } from 'lib/constants';

export const metadata = {
  title: 'Search',
  description: 'Search for products in the Lizmart Online store.'
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue, page: pageParam } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;


  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

 
  const { items, totalPages, total } = await getProducts({ sortKey, reverse, query: searchValue, page });

  const resultsText = items.length > 1 ? 'results' : 'result';

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {items.length === 0
            ? 'There are no products that match '
            : `Showing ${items.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {items.length > 0 ? (
        <div >
          <ProductGrid items={items} currentPage={page} totalPages={totalPages} searchParams={{ q: searchValue, sort: sort ?? undefined }} />
        </div>
      ) : null}
    </>
  );
}
