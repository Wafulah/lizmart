import { ArrowRight, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


const footerMenus = [
    {
      title: "Men's Health",
      links: [
        { name: 'Sexual Health', href: '/search/male-enhancement' },
        { name: 'Supplements', href: '/search/men-supplements' },
        { name: 'Baldness & Hair Loss', href: '/health-need/skin-hair-nails' },
        { name: 'Prostate Care', href: '/health-need/prostate-care' },
      ],
    },
    {
      title: "Women's Health",
      links: [
        { name: 'Supplements', href: '/search/ladies-suppliments' },
        { name: 'Menstrual Health', href: '/search/female-enhancement' },
        { name: 'Fertility & Pregnancy', href: '/health-need/female-fertility' },
        { name: 'Hormone Balance', href: '/health-need/female-hormone-balance' },
      ],
    },
    {
      title: 'Wellness & Lifestyle',
      links: [
        { name: 'By Health Needs', href: '/health-need'},
        { name: 'Vitamins & Minerals', href: '/health-need/vitamins' },
        { name: 'Joints & Bones', href: '/health-need/joins-bones' },
        { name: 'Stress & Sleep', href: '/health-need/brain-function' },
        { name: 'Digestive Health', href: '/health-need/digestion' },
        { name: 'Weight Management', href: '/health-need/weight-management' },
      ],
    },
    {
      title: 'Information',
      links: [
        { name: 'About Lizmart', href: '/about-us' },
        { name: 'FAQs', href: '/faqs' },
        { name: 'Shipping & Returns', href: '/shipping-returns' },
        { name: 'Terms & Conditions', href: '/terms-conditions' },
      ],
    },
  ];


const MockLogo = () => (
    <div className="relative flex items-center justify-center w-10 h-10 bg-teal-400 rounded-full text-teal-900 font-bold text-lg">
        <Image src="/logo.png" alt="Lizmart Logo" fill className='object-cover rounded-full' />
    </div>
);

// --- MAIN FOOTER COMPONENT ---
const Footer = () => {
    const currentYear = new Date().getFullYear();
    const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
    const copyrightName = 'Lizmart Naturals'; 

    return (
        // Main footer color inspired by Kalonji.co.ke: deep, earthy teal/green
        <footer className="text-sm bg-teal-900 text-teal-200 antialiased">
            {/* Top Section: Logo, Contact, and Categories */}
            <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

                    {/* Column 1: Brand Info & Contact Button (Mobile: Full Width, Desktop: 3/12) */}
                    <div className="md:col-span-3 space-y-6">
                        {/* Logo and Name */}
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <MockLogo />
                            <span className="uppercase font-extrabold text-lg tracking-wider">LIZMART NATURALS</span>
                        </Link>

                        <p className="text-teal-300">
                            Your trusted source for natural medicine and wellness products, delivered straight to your door.
                        </p>

                        {/* Contact Us Button */}
                        <Link
                            href="/contact-us"
                            className="inline-flex items-center justify-center px-6 py-3 font-semibold text-teal-900 bg-teal-400 rounded-lg shadow-md hover:bg-teal-300 transition-colors duration-300"
                        >
                            Contact Us
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>

                        {/* Social Icons Placeholder */}
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="hover:text-teal-400 transition"><MapPin className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-teal-400 transition"><Mail className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-teal-400 transition"><Phone className="w-5 h-5" /></Link>
                            {/* Adding Shopping Bag icon as relevant to commerce */}
                            <Link href="/cart" className="hover:text-teal-400 transition" prefetch={false}><ShoppingBag className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Column 2, 3, 4, 5: Category Links (Desktop: 9/12) */}
                    <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {footerMenus.map((menu, index) => (
                            <div key={index} className="space-y-4">
                                <h3 className="text-base font-bold uppercase tracking-wider text-teal-100 border-b border-teal-700 pb-2 mb-2">
                                    {menu.title}
                                </h3>
                                <ul className="space-y-3">
                                    {menu.links.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                // Link styling uses lighter text color with teal accent on hover
                                                className="text-teal-300 hover:text-teal-400 transition-colors duration-200"
                                                prefetch={false}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Bottom Section: Copyright and Credits */}
            <div className="border-t border-teal-800 bg-teal-950 py-6 text-xs">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between min-[1320px]:px-0">
                    {/* Copyright (Keep 2023 - Current Year Logic) */}
                    <p className="text-teal-500 order-2 md:order-1 text-center md:text-left">
                        &copy; {copyrightDate} {copyrightName}. All rights reserved.
                    </p>

                    {/* Credit (Keep Master Tech Solutions) */}
                    <p className="text-teal-400 order-1 md:order-2 text-center md:text-right">
                        <Link
                            href="https://www.mastertechsolutionscenter.com"
                            className="font-medium hover:text-teal-300 transition-colors"
                            prefetch={false}
                        >
                            Created by Master Tech Solutions Center
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;