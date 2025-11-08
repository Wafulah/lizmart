import Footer from '@/components/layout/footer';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import React from 'react';

// Mock component for the contact form
const ContactForm = () => {
    return (
        <form className="space-y-6 p-8 bg-white rounded-lg shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-teal-600" />
                Send Us a Message
            </h3>
            <p className="text-gray-500 text-sm">Our team typically responds within one business day.</p>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message</label>
                <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="How can we help you today?"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                ></textarea>
            </div>
            
            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
            >
                Submit Inquiry
            </button>
        </form>
    );
};

// Mock map placeholder component
const MapPlaceholder = () => (
    <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
        <img
            src="https://placehold.co/800x600/374151/ffffff?text=Map+Placeholder"
            alt="Map of Lunga Lunga Square, Nairobi, Kenya"
            className="w-full h-full object-cover"
        />
        <div className="p-4 text-center text-sm text-gray-700 bg-gray-100 border-t">
            Click to open on Google Maps
        </div>
    </div>
);


/**
 * Contact Us Page Component for the /contact route.
 */
export default function ContactUsPage() {
    // Master Tech Solutions Center Contact Details
    const CONTACT = {
        phone: '+254 727 717 019',
        email: 'info@lizmartNaturals.com',
        addressLine1: 'Kenya cinema plaza',
        addressLine2: 'Nairobi, Kenya',
        mapLink: 'https://www.google.com/maps/place/Lunga+Lunga+Square/@-1.3087667,36.860551,17z/data=!3m1!4b1!4m6!3m5!1s0x182f1178fb49dcd9:0xa7fec12b9388d239!8m2!3d-1.3087667!4d36.860551!16s%2Fg%2F1ptw2r2pt?entry=ttu&g_ep=EgoyMDI1MTAyNy4wIKXMDSoASAFQAw%3D%3D' // Placeholder for actual map link
    };

    return (
        <div className="min-h-screen bg-gray-50">
            
            {/* Header / Intro Section */}
            <header className="bg-teal-700 py-16">
                <div className="max-w-screen-xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight">
                        Get In Touch
                    </h1>
                    <p className="mt-4 text-xl text-teal-100 max-w-3xl mx-auto">
                        We're ready to help you elevate your health. Choose the best way to reach us below.
                    </p>
                </div>
            </header>

            {/* Main Content: Two Columns (Form and Details) */}
            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Column 1: Contact Form (Takes 2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>

                    {/* Column 2: Contact Details and Map (Takes 1/3 width on large screens) */}
                    <div className="lg:col-span-1 space-y-10">
                        
                        {/* Interactive Contact Boxes (UX Principle: Clear CTAs) */}
                        <div className="space-y-4">
                            
                            {/* Phone CTA */}
                            <a 
                                href={`tel:${CONTACT.phone.replace(/ /g, '')}`} 
                                className="block p-5 bg-white border-l-4 border-[#15654E] rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:scale-[1.01] group"
                            >
                                <Phone className="w-6 h-6 text-[#15654E] mb-2" />
                                <p className="text-sm text-gray-500">Call Us Directly</p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#15654E] transition">
                                    {CONTACT.phone}
                                </p>
                            </a>
                            
                            {/* Email CTA */}
                            <a 
                                href={`mailto:${CONTACT.email}`} 
                                className="block p-5 bg-white border-l-4 border-[#FFC107] rounded-lg shadow-md hover:shadow-xl transition duration-300 transform hover:scale-[1.01] group"
                            >
                                <Mail className="w-6 h-6 text-[#FFC107] mb-2" />
                                <p className="text-sm text-gray-500">Send an Email</p>
                                <p className="text-lg font-bold text-gray-800 group-hover:text-[#FFC107] transition">
                                    {CONTACT.email}
                                </p>
                            </a>
                            
                            {/* Address Info */}
                            <div className="p-5 bg-white border-l-4 border-teal-600 rounded-lg shadow-md">
                                <MapPin className="w-6 h-6 text-teal-600 mb-2" />
                                <p className="text-sm text-gray-500">Visit Our Office</p>
                                <p className="text-lg font-bold text-gray-800">{CONTACT.addressLine1}</p>
                                <p className="text-md text-gray-600">{CONTACT.addressLine2}</p>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        {/* <a href={CONTACT.mapLink} target="_blank" rel="noopener noreferrer">
                            <MapPlaceholder />
                        </a> */}
                    </div>
                </div>
            </main>

            {/* Support Hours (UX Principle: Setting Expectations) */}
            <section className="bg-white border-t py-12">
                <div className="max-w-screen-xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Support Hours</h2>
                    <p className="text-lg text-gray-600">
                        Our customer service is available <b>Monday - Friday </b> from <b>9:00 AM to 5:00 PM (EAT)</b>.
                    </p>
                    <p className="text-md text-gray-500 mt-1">
                        Urgent technical support is available 24/7 for managed IT clients.
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    );
}
