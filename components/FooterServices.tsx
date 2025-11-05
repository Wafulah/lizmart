import { CreditCard, HandHeart, TrendingUp, Truck } from 'lucide-react';

export const FooterServices: React.FC = () => {
    
    const iconStyle = { 
        color: '#135628', 
        size: 32
    };

    return (
        <div className="mx-auto max-w-7xl px-5 py-12 border-t border-gray-100 bg-[#f0f4f8]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

                {/* 1. Free Shipping (Local Focus) */}
                <div className="flex flex-col items-center">
                    <Truck style={iconStyle} className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg text-gray-800">Free Shipping</h3>
                    <p className="text-gray-600">On all orders within <b>Nairobi and its environs</b>.</p>
                </div>

                {/* 2. Guaranteed Results (Strong Promise) */}
                <div className="flex flex-col items-center">
                    <TrendingUp style={iconStyle} className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg text-gray-800">Guaranteed Results</h3>
                    <p className="text-gray-600">Noticeable effects within <b>30 days</b> or your money back.</p>
                </div>

                {/* 3. Secure Checkout */}
                <div className="flex flex-col items-center">
                    <CreditCard style={iconStyle} className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg text-gray-800">Secure Checkout</h3>
                    <p className="text-gray-600">Protected by Stripe, M-Pesa, and all major cards.</p>
                </div>

                {/* 4. Natural & Ethical (REPLACEMENT) */}
                <div className="flex flex-col items-center">
                    <HandHeart style={iconStyle} className="w-8 h-8 mb-3" />
                    <h3 className="font-bold text-lg text-gray-800">Natural & Ethical</h3>
                    <p className="text-gray-600"><b>100% natural, GMO-Free</b>, and ethically sourced ingredients.</p>
                </div>

            </div>
        </div>
    );
};