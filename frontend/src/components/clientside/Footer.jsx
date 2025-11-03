import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const contactInfo = [
    { icon: <Phone className="w-5 h-5" />, text: "91-9456748967" },
    { icon: <Mail className="w-5 h-5" />, text: "buildtrue@gmail.com" },
    { icon: <MapPin className="w-5 h-5" />, text: "123 Construction Ave, Kovilpatti, Tuticoin" }
  ];

  const quickLinks = [
    { text: "Our Services", href: "/services" },
    { text: "Recent Projects", href: "/projects" },
    { text: "About Us", href: "/about" },
    { text: "Contact Us", href: "/contact" }
  ];

  const services = [
    "Residential Construction",
    "Commercial Buildings",
    "Renovation Services",
    "Project Management",
    "Interior Design",
    "Construction Consulting"
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Construction Co.</h3>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner in construction excellence, delivering quality projects with integrity and professionalism.
            </p>
             
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li 
                  key={index}
                  className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-400">
                  <span className="text-orange-500">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400">
             Created by Petchipandi S @ All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;