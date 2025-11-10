
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getHealthTopicByHandle, getProductsByTopicId } from "@/actions/api/get-health-topic";
import { Heading } from "@/components/ui/dashboard/heading";
import { Separator } from "@/components/ui/separator";
import ProductGrid from "@/components/grid/related-product-grid"; 
import { Metadata } from "next";

interface TopicDetailPageProps {
  params: { handle: string };
  searchParams: { page?: string };
}



export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  

  const topic = await getHealthTopicByHandle(params.handle);

  if (!topic) {
    return { title: "Topic Not Found" };
  }

  const seoTitle = topic.seo?.title || `${topic.title} | Health Topic`;
  const seoDescription = topic.seo?.description || `Learn about ${topic.title} and find related products.`;

  return {
    title: seoTitle,
    description: seoDescription,
  };
}

export default async function TopicDetailPage(props: { params: Promise<{ handle: string }>; 
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const page = Number(searchParams.page || 1);
  const perPage = 12;

  const topic = await getHealthTopicByHandle(params.handle);
  
  if (!topic) {
    // UI/UX Consideration: Use Next.js notFound() for 404
    notFound();
  }

  // Fetch related products using the topic's ID
  const { items, totalPages } = await getProductsByTopicId({
    topicId: topic.id,
    page,
    perPage,
  });

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 md:px-6">
      {/* Topic Header */}
      <Heading 
        title={topic.title} 
        description="Expert insights and recommended solutions for this health need." 
      />
      <Separator className="my-6" />

      {/* Topic Content (Markdown) */}
      <section className="bg-white p-6 md:p-10 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">In-Depth Guide</h2>
        {/* UI/UX Consideration: Use `prose` class for elegant markdown rendering */}
        <div className="prose max-w-none text-gray-700">
          <ReactMarkdown>{topic.description}</ReactMarkdown>
        </div>
      </section>

      {/* Related Products */}
      <section>
        <h2 className="text-2xl font-bold text-teal-700 mb-6">Related Products</h2>
        
        {items.length > 0 ? (
         
          <ProductGrid 
            items={items} 
            currentPage={page} 
            totalPages={totalPages} 
            title={topic.title}
          />
          
        ) : (
          <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
            No specific products are linked to this topic yet.
          </div>
        )}
      </section>
    </div>
  );
}