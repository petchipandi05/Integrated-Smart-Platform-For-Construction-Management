import React from 'react';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; 
import aboutimage from '../../images/aboutimage.jpg'
import backgroundimage from '../../images/backgroundimage.jpg'
import recentproject1 from '../../images/recentproject1.jpg'
import recentproject2 from '../../images/recentproject2.jpg'
import recentproject3 from '../../images/recentproject3.jpg'
import recentproject4 from '../../images/recentproject4.jpg'

const HomePageContent= () => {
  const navigate = useNavigate();
  const projects = [
    {
      id: 1,
      image: `${recentproject1}`,
      location: "No. 45, North Usman Road, T. Nagar,Chennai – 600017,",
      area: "40,000 Sft",
      alt: "Modern apartment building with decorative facade at night"
    },
    {
      id: 2,
      image:`${recentproject2}`,
      location: "No. 27, L.B. Road, Adyar,Chennai – 600020,",
      area: "28,500 Sft",
      alt: "Contemporary house with balcony and planters"
    },
    {
      id: 3,
      image:`${recentproject3}`,
      location: "Plot No. 12, 2nd Avenue, Anna Nagar,Chennai – 600040,",
      area: "32,000 Sft",
      alt: "White villa with landscaped garden"
    },
    {
      id: 4,
      image:`${recentproject4}`,
      location: "No. 18, Velachery Main Road, Velachery,Chennai – 600042,",
      area: "24,600 Sft",
      alt: "Modern duplex with wooden accents"
    }
  ];
  const handleContactUs = () => {
    navigate('/contact');
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <div className="h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={backgroundimage}
            alt="Construction site worker"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 lg:px-8">
          <div className="mt-32 lg:mt-40 max-w-2xl">
            <span className="text-orange-500 font-semibold text-sm tracking-wider">
              IT'S AN AMAZING SERVICES!
            </span>

            <h1 className="text-white text-4xl lg:text-5xl font-bold mt-4 leading-tight">
              Construction Solution We
              <br />
              Build Your Dream
            </h1>

            <p className="text-gray-300 mt-6 max-w-xl text-base">
              Transform the way you manage construction projects with real-time tracking, transparent updates, and seamless communication between contractors and clients.
            </p>

            <div className="flex gap-4 mt-8">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded text-sm font-semibold transition-colors"
              >
                READ MORE
              </button>

              <button
                onClick={handleContactUs}
                className="bg-transparent hover:bg-orange-500/10 text-white border border-orange-500 px-8 py-3 rounded text-sm font-semibold transition-colors"
              >
                GET STARTED
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div>
      <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          <div className="lg:w-1/2 space-y-6">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
                About Us
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
                Building the Future with Innovation & Precision
              </h2>
            </div>

            <p className="text-gray-600 leading-relaxed">
              With over 7 years of industry expertise, we've successfully completed more than 500 construction 
              projects while maintaining a remarkable 98% customer satisfaction rate. Our commitment to 
              excellence and transparent communication sets us apart in the construction industry.
            </p>

            <p className="text-gray-600 leading-relaxed">
              We believe in keeping our clients informed every step of the way. Our dedicated project 
              management team provides regular updates on construction progress, ensuring you're always 
              in the loop. From residential builds to commercial projects, we deliver quality results 
              that stand the test of time.
            </p>

            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded text-sm font-semibold transition-colors mt-4"
            >
              LEARN MORE
            </button>
          </div>
          <div className="lg:w-1/2">
            <div className="relative h-[500px] rounded-lg overflow-hidden group">
              <img
                src={aboutimage}
                alt="Construction site"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

      {/* Recent Projects Section */}
      <div>
            <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="py-1 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-orange-500 font-medium">RECENT PROJECTS</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Featured Construction Projects</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-4"></div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left column - wider and aligned with second right image */}
          <div className="col-span-6 md:col-span-5">
            <div className="relative group overflow-hidden h-[600px]">
              <img 
                src={projects[0].image}
                alt={projects[0].alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-300 group-hover:bg-opacity-40"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-lg font-bold text-gray-900">{projects[0].location}</h3>
                <p className="text-gray-700">{projects[0].area}</p>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="col-span-6 md:col-span-7">
            <div className="grid grid-cols-2 gap-6">
              {/* Top row */}
              <div className="relative group overflow-hidden h-64">
                <img 
                  src={projects[1].image}
                  alt={projects[1].alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-300 group-hover:bg-opacity-40"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-lg font-bold text-gray-900">{projects[1].location}</h3>
                  <p className="text-gray-700">{projects[1].area}</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden h-64">
                <img 
                  src={projects[2].image}
                  alt={projects[2].alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-300 group-hover:bg-opacity-40"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-lg font-bold text-gray-900">{projects[2].location}</h3>
                  <p className="text-gray-700">{projects[2].area}</p>
                </div>
              </div>
              
              {/* Bottom row */}
              <div className="relative group overflow-hidden h-62">
                <img 
                  src={projects[3].image}
                  alt={projects[3].alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-300 group-hover:bg-opacity-40"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white bg-opacity-90 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-lg font-bold text-gray-900">{projects[3].location}</h3>
                  <p className="text-gray-700">{projects[3].area}</p>
                </div>
              </div>
              
              <div className="relative h-68">
                <div className="border-2 border-orange-500 p-4 w-full h-full flex flex-col items-center justify-center bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Projects Portfolio</h2>
                  <p className="text-gray-700 mb-4">Enter this creative space to explore</p>
                  <button 
                    className="bg-orange-500 text-white font-bold py-2 px-4 hover:bg-yellow-600 transition duration-300 border border-yellow-600"
                  >
                    MORE PROJECTS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>

      {/* Contact Us Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm tracking-wider">GET IN TOUCH</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-[#002333]">Start Your Project With Us</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto mt-6">
              Ready to bring your construction dream to life? Our team of experts is here to help you turn your vision into reality. Contact us today to discuss your project needs.
            </p>
          </div>

          {/* Contact Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleContactUs}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              CONTACT US NOW
            </button>
          </div>
        </div>
      </div>
        <Footer/>
    </div>
  );
};

export default HomePageContent;