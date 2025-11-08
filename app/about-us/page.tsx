import Footer from '@/components/layout/footer';
import {
  CheckCircle,
  DollarSign,
  Globe,
  Heart,
  Home,
  Leaf,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Users
} from 'lucide-react';
import React from 'react';

// Define the color palette based on a health/natural theme
const PALETTE = {
  primaryGreen: 'text-teal-700',
  accentGold: 'text-amber-500',
  bgLight: 'bg-green-50',
  bgDark: 'bg-teal-900',
  textDark: 'text-gray-800',
  textLight: 'text-white',
};

// Data structure for the Focus/Values section
type FocusItem = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const coreValues: FocusItem[] = [
  {
    icon: ShieldCheck,
    title: 'Uncompromising Quality',
    description: '100% natural, well-researched formulas that exceed global industry standards and expectations.',
  },
  {
    icon: Leaf,
    title: 'Expert Sourcing & Safety',
    description: 'We subject all products from our global manufacturers to statistical evidence of workability, safety, and effectiveness.',
  },
  {
    icon: DollarSign,
    title: 'Exceptional Value',
    description: 'Direct sourcing ensures cost-effective prices and maximum benefit delivery to our loyal market base.',
  },
];

const contactDetails: FocusItem[] = [
    {
        icon: Home,
        title: 'Physical Shop (LIZMART NATURALS)',
        description: 'Kenya Cinema Plaza, 4th Floor, Room No. 4--4B. Located next to Safaricom Customer Service Moi Avenue.',
    },
    {
        icon: ShoppingBag,
        title: 'Our Pickup Point',
        description: 'You can pickup from our ofice at kenya Cinema or request a delivery.',
    },
    {
        icon: Phone,
        title: 'Order & Inquiries',
        description: 'WhatsApp/Call: +254 727 717 019 . We are managed by a team of experts.',
    },
];

/**
 * About Us Page Component for LIZMART NATURALS.
 * Focused on health, wellness, quality, and comprehensive product range.
 */
export default function AboutUsPage() {
  return (
    <div className={`min-h-screen ${PALETTE.bgLight} ${PALETTE.textDark}`}>

      {/* Hero Header */}
      <header className={`py-12 md:py-16 ${PALETTE.bgDark}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            LIZMART NATURALS: Your Health, Your Wealth
          </h1>
          <p className="mt-3 text-lg text-teal-200 max-w-3xl mx-auto">
            An Experienced, Dynamic, and Vibrant Distributor of Health & Wellness Supplements/Cosmetics, now serving Africa and Europe.
          </p>
          <p className="mt-2 text-xl font-bold text-amber-400">
            Call/WhatsApp: +254 727 717 019
          </p>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* 1. Who We Are & Our Mission */}
        <section className="mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold ${PALETTE.primaryGreen} mb-6 border-b-4 border-amber-500 pb-3`}>
            Our Story: Global Quality, Local Reach 
          </h2>
          <div className="lg:flex lg:space-x-12">
            <div className="lg:w-2/3">
              <p className="mt-4 text-lg leading-relaxed">
                LIZMART NATURALS is an Experienced, Dynamic, Vibrant Health & Wellness Supplements/cosmetics Distributor with a Proven Record of Success. Though based in <b>Kenya</b>, we have gone beyond borders all over Africa and Europe supplying our various supplements.
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                We are proud to be in the thick of the Global Supplement Industry, with ingredients and formulas that Exceed Industry Standards and Expectations. We are Passionate About Uncompromising Devotion to Well Researched Formulas and All Natural Ingredients that ensure consistent benefits for our loyal market base.
              </p>
              <blockquote className="mt-6 p-4 border-l-4 border-amber-500 bg-gray-100 italic text-lg text-gray-700">
                “Quality is superior, Service is supreme, Reputation is first” is the management tenet we pursue. We devote to helping consumers to regain their youthful and healthy life based on our great quality products.
              </blockquote>
            </div>

            {/* Core Values / Focus Areas */}
            <div className="lg:w-1/3 mt-12 lg:mt-0">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-teal-100">
                <h3 className={`text-2xl font-semibold ${PALETTE.primaryGreen} mb-6`}>Our Core Values</h3>
                <div className="space-y-6">
                  {coreValues.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <item.icon className={`w-6 h-6 ${PALETTE.accentGold} flex-shrink-0 mt-1`} />
                      <div className="ml-4">
                        <p className="font-semibold text-lg">{item.title}</p>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-16 border-teal-200" />

        {/* 2. Comprehensive Product Range */}
        <section className="mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold ${PALETTE.primaryGreen} mb-6 border-b-4 border-amber-500 pb-3`}>
            Product Portfolio: The Widest Selection in Kenya 🛍️
          </h2>
          <p className="text-xl italic text-gray-600 mb-8">
            As a Direct Sourcer and Distributor, we ensure maximum benefit delivery at cost-effective prices.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Health Supplements */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <Heart className={`w-8 h-8 mb-4 ${PALETTE.primaryGreen}`} />
              <h3 className="text-xl font-bold mb-3">Health & Wellness Supplements</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Vitamins & Minerals</li>
                <li>Natural Body Shape Enhancement</li>
                <li>Sexual Stamina and Performance  </li>
                <li>Overall Wellbeing   &   Emotional Health  </li>
                <li>Herbal products &   Ayurvedic Herbs in Kenya  </li>
              </ul>
            </div>

            {/* Superfoods & Pantry */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <Leaf className={`w-8 h-8 mb-4 ${PALETTE.primaryGreen}`} />
              <h3 className="text-xl font-bold mb-3">Superfoods & Natural Foods</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Honey & Essential Oils</li>
                <li>Natural Juices  </li>
                <li>Seeds & Nuts (great for spices in bulk in Nairobi)</li>
                <li>Organic Herbs Kenya</li>
                <li>Lizmart Naturals and other superfoods</li>
              </ul>
            </div>

            {/* Beauty & Cosmetics */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <Star className={`w-8 h-8 mb-4 ${PALETTE.primaryGreen}`} />
              <h3 className="text-xl font-bold mb-3">Cosmetics & Beauty Solutions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Skin Health & Dermatological Damage Reversal</li>
                <li>Solutions for Stretch Marks and Scars</li>
                <li>Lady's Human Hair, Peruvian & Brazilian Wigs and Extensions</li>
                <li>Men and Women SEX TOYS</li>
              </ul>
            </div>
            
            {/* Partner & Reseller */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <Users className={`w-8 h-8 mb-4 ${PALETTE.primaryGreen}`} />
              <h3 className="text-xl font-bold mb-3">Distribute & Partner</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>White Label Options for your own brand</li>
                <li>Bulk purchase opportunities</li>
                <li>Products from our partner manufacturers</li>
                <li>Exceptional Product Range Value is at The Core of Our Success Story</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="my-16 border-teal-200" />

        {/* 3. Location and Delivery */}
        <section className="mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold ${PALETTE.primaryGreen} mb-8 border-b-4 border-amber-500 pb-3`}>
            Location, Delivery & Contact Details
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactDetails.map((item, index) => (
                <div key={index} className="flex items-start bg-white p-6 rounded-lg shadow-md">
                    <item.icon className={`w-8 h-8 ${PALETTE.accentGold} flex-shrink-0 mt-1`} />
                    <div className="ml-4">
                        <p className="font-bold text-lg">{item.title}</p>
                        <p className="text-gray-700 text-base mt-1">{item.description}</p>
                    </div>
                </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-teal-100 rounded-xl shadow-inner">
            <h3 className={`text-2xl font-bold ${PALETTE.primaryGreen} mb-4 flex items-center`}>
              <Truck className='w-6 h-6 mr-2' /> Fast & Flexible Delivery Options
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-lg">
              <p className="flex items-center">
                <CheckCircle className='w-5 h-5 text-teal-600 mr-2 flex-shrink-0' />
                Delivery Nationwide within 24h
              </p>
              <p className="flex items-center">
                <CheckCircle className='w-5 h-5 text-teal-600 mr-2 flex-shrink-0' />
                <b>FREE Delivery within Nairobi </b>
              </p>
              <p className="flex items-center">
                <CheckCircle className='w-5 h-5 text-teal-600 mr-2 flex-shrink-0' />
                FREE Nationwide Delivery for orders Ksh 3,000/- & Above
              </p>
              <p className="flex items-center">
                <CheckCircle className='w-5 h-5 text-teal-600 mr-2 flex-shrink-0' />
                Payments via Mpesa Till number 5662836 or Cash on Delivery (Nairobi)
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer CTA (Call to Action) */}
      <section className={`${PALETTE.bgDark} py-12`}>
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Experience LIZMART NATURALS Quality?
          </h2>
          <p className="mt-4 text-teal-100 text-lg">
            Whether you are a <b>Health Supplement Consumer</b>, a <b>Distributor</b>, or a <b>Re-Seller</b>, we are ready to deliver.
          </p>
          <div className="mt-8 space-x-4">
            <a
              href="https://lizmartnaturals.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 text-teal-900 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-amber-400 transition duration-300 inline-flex items-center"
            >
              <Globe className='w-5 h-5 mr-2' />
              Shop Online Now
            </a>
            <a
              href="tel:+254727717019"
              className="bg-transparent border border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white/10 transition duration-300 inline-flex items-center"
            >
              <Phone className='w-5 h-5 mr-2' />
              Call/WhatsApp Us
            </a>
          </div>
        </div>
      </section>
<Footer />
    </div>
  );
}