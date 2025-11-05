
import Image from "next/image";
import Link from "next/link";

export type FeaturedProduct = {
  id: string;
  imageURL: string;
  title: string;
  price: number;
  handle: string;
  compareAtPrice?: number;
  collectionName: string;
  featured?: boolean; 
}
type FeaturedProductsSectionProps = {
  products: FeaturedProduct[];
};

export default function FeaturedProductsSection({
  products,
}: FeaturedProductsSectionProps) {
  return (
    <section className="bg-[#f0f4f8] p-8 mb-24">
      {/* Heading */}
      <h2 className="text-[#004d4d] font-serif text-4xl text-center mb-10">
        Featured Products
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Sub-component: ProductCard
function ProductCard({ product }: { product: FeaturedProduct }) {
   
  return (
    <Link href={`/product/${product.handle}`} className="block">
    <div className="bg-white border h-[180px]  border-gray-100 rounded-xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.12),0_4px_12px_rgba(251,191,36,0.25)] transition-shadow duration-300">
   <div className="flex items-start gap-4">
        
       <div className="w-1/3 relative aspect-square">
  <Image
    src={product.imageURL}
    alt={product.title}
    fill
    className="object-cover rounded-sm"
  />
</div>

        {/* Details */}
        <div className="flex flex-col pt-2 flex-1">
          {/* Collection Name */}
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
            {product.collectionName}
          </p>

          {/* Title */}
          <h3 className="text-lg font-bold text-[#004d4d] mb-1 hover:text-green-500 cursor-pointer">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400 font-bold">
              KES {product.price.toFixed(2)}
            </span>
            {/* {product.compareAtPrice && (
              <span className="text-gray-400 line-through">
                KES {product.compareAtPrice.toFixed(2)}
              </span>
            )} */}
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
