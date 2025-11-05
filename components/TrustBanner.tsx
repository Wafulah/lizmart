import { Feather, Leaf, Shield, TrendingUp } from 'lucide-react';
import Image from "next/image";
import React from 'react';

// Define your color palette for type safety (optional but good practice)
interface ColorPalette {
    DeepGreen: string;
    BrightYellow: string;
}

const colors: ColorPalette = {
    DeepGreen: '#1D7A39',
    BrightYellow: '#FBC02D',
};


const PLACEHOLDER_IMAGE_URL: string = "/family.jpg"; 

// Use React.FC (Functional Component) typing
const TrustBanner: React.FC = () => {
  return (
    // Outer section with margins and full width
    <section className="mx-auto max-w-7xl px-4 py-8 mt-16 mb-24">
      
      {/* Main Banner Container - Using a subtle gradient background */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 lg:flex items-center justify-between p-8 md:p-12 rounded-2xl shadow-xl border border-gray-200">
        
        {/* Left Section for Image - Takes up half the space on large screens */}
       <div className="lg:w-1/2 flex justify-center items-center p-4 order-last lg:order-first">
  
  {/* The Wrapper for the Image Component */}
  <div className="relative w-full max-w-lg h-96 md:h-[450px] lg:h-[500px] rounded-xl shadow-2xl overflow-hidden">
    <Image
      src={PLACEHOLDER_IMAGE_URL} 
      alt="Happy people trusting Lizmart Naturals supplements" 
      fill 
      style={{ objectFit: 'cover' }}       
      className="transition-transform duration-500 hover:scale-[1.05]" 
    />
  </div>
  
</div>

        {/* Right Section for Text - Takes up half the space on large screens */}
        <div className="lg:w-1/2 p-4 text-center lg:text-left mt-8 lg:mt-0">
          
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
            <span style={{ color: colors.DeepGreen }}>Experience True Wellness:</span> Your Journey to a Healthier You Starts Here!
          </h2>
          
          <p className="text-gray-700 mb-6 text-lg">
            At LIZMART NATURALS, your health is our ultimate priority. We are passionate about delivering 
            <strong style={{ color: colors.DeepGreen }}> Global Quality, Local Reach</strong> supplements and natural solutions that you can trust implicitly. 
            Every product in our portfolio undergoes rigorous sourcing, ensuring 
            <strong style={{ color: colors.DeepGreen }}>100% natural, well-researched formulas</strong> that not only meet but 
            <strong style={{ color: colors.BrightYellow }}> exceed global industry standards</strong>. We believe in 
            <strong style={{ color: colors.DeepGreen }}> Uncompromising Devotion</strong> to effectiveness, safety, and your consistent benefits. 
          </p>

          {/* Trust Points Grid */}
         
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8 text-lg font-medium text-gray-800">
            
            <div className="flex items-center">
              {/* Icon 1: Expert-Sourced Ingredients */}
              <Feather
                style={{ color: colors.DeepGreen }} 
                className="w-6 h-6 mr-2 flex-shrink-0" 
              /> Expert-Sourced Ingredients
            </div>
            
            <div className="flex items-center">
              {/* Icon 2: Exceeds Global Standards */}
              <Shield
                style={{ color: colors.DeepGreen }} 
                className="w-6 h-6 mr-2 flex-shrink-0" 
              /> Exceeds Global Standards
            </div>
            
            <div className="flex items-center">
              {/* Icon 3: 100% Natural Formulas */}
              <Leaf
                style={{ color: colors.DeepGreen }} 
                className="w-6 h-6 mr-2 flex-shrink-0" 
              /> 100% Natural Formulas
            </div>
            
            <div className="flex items-center">
              {/* Icon 4: Proven Record of Success */}
              <TrendingUp
                style={{ color: colors.DeepGreen }} 
                className="w-6 h-6 mr-2 flex-shrink-0" 
              /> Proven Record of Success
            </div>
            
          </div>

          {/* Call to Action Button */}
          <a 
            href="/search/general" 
            className="inline-block px-10 py-3 text-lg font-bold rounded-full transition-all duration-300 transform shadow-md hover:scale-[1.03] hover:shadow-lg"
            style={{ backgroundColor: colors.BrightYellow, color: colors.DeepGreen }}
          >
            VIEW OUR PROMISE & PRODUCTS
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;