import { HelpCircle, DollarSign, Truck, Sparkles, Handshake } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Footer from '@/components/layout/footer';

const faqsData = [
  {
    id: "item-1",
    icon: <HelpCircle className="w-5 h-5 text-[#2e7d32]" />,
    question: "What is Lizmart Naturals and what is your history?",
    answer: "LIZMART NATURALS is an Experienced, Dynamic, and Vibrant distributor specializing in high-quality health, wellness supplements, and cosmetics. We have been proudly operational and serving our market since 2023, with a proven record of success. Though our base is in Kenya, we supply our products across Africa and Europe.",
  },
  {
    id: "item-2",
    icon: <Sparkles className="w-5 h-5 text-[#2e7d32]" />,
    question: "How can I be assured of product quality and safety?",
    answer: "Our core management tenet is: 'Quality is superior, Service is supreme, Reputation is first.' We ensure Uncompromising Quality by using 100% natural, well-researched formulas that consistently Exceed Industry Standards. Every product is subjected to rigorous safety checks and statistical evidence to guarantee workability and effectiveness.",
  },
  {
    id: "item-3",
    icon: <DollarSign className="w-5 h-5 text-[#2e7d32]" />,
    question: "What secure payment methods do you accept?",
    answer: (
      <>
        We offer secure and flexible payment options:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><b>Automated Checkout:</b> Seamless M-Pesa automated STK Push payment during checkout.</li>
          <li><b>M-Pesa Till Number (Buy Goods):</b> Use <b>5662836</b> (Business Name: LIZMART NATURALS).</li>
          <li><b>M-Pesa Paybill (KCB Bank):</b> Use Paybill <b>522533</b>, Account/Till Number: <b>8882031</b>.</li>
          <li><b>Cash on Delivery (COD):</b> Available for orders within <b>Nairobi</b> only.</li>
        </ul>
      </>
    ),
  },
  {
    id: "item-4",
    icon: <Truck className="w-5 h-5 text-[#2e7d32]" />,
    question: "What is your typical delivery timeframe?",
    answer: "We guarantee <b>Nationwide Delivery within 24 hours across Kenya from the time of order confirmation. For exact fee details, please review our comprehensive Shipping Policy.",
  },
  {
    id: "item-5",
    icon: <Handshake className="w-5 h-5 text-[#2e7d32]" />,
    question: "Do you offer wholesale, white label, or partnership opportunities?",
    answer: "Yes, we actively seek distributors and partners. We offer White Label Options for clients looking to start their own brand, and significant Bulk Purchase opportunities. Please reach out to us directly via phone or email to discuss wholesale terms.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Everything you need to know about Lizmart Naturals, our quality, and your order.
        </p>
      </header>

       <Accordion type="single" collapsible className="w-full space-y-2">
        {faqsData.map((item) => (
          <AccordionItem 
            key={item.id} 
            value={item.id} 
            className="border-b border-gray-200 p-0 last:border-b-0 bg-white rounded-lg shadow-sm"
          >
            <AccordionTrigger className="flex items-start text-left hover:no-underline py-4 px-6 focus:outline-none data-[state=open]:bg-green-50 rounded-t-lg">
              <span className="flex items-start w-full">
                {/* Icon is placed next to the question text */}
                {item.icon}
                <span className="ml-3 text-lg font-semibold text-gray-800 hover:text-[#2e7d32] transition-colors duration-150">
                  {item.question}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pl-14 pr-6 pb-4 pt-0 text-base text-gray-600">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <footer className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200 text-center">
        <p className="text-base text-gray-700">
          Can't find your answer? Call/WhatsApp us directly at 
          <span className="font-bold text-[#2e7d32]"> +254 727 717 019 </span> 
          or email us at info@lizmartNaturals.com.
        </p>
      </footer>
      <div className="w-screen">
  <Footer />
      </div>
    </div>
  );
}