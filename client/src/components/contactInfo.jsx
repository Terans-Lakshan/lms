import React, { useState } from 'react';
import uopLogo from '../assets/uop.jpg';

const ContactInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer 
      className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white transition-all duration-300 ease-in-out mt-auto fixed bottom-0 left-0 right-0 z-40"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-300 ${isExpanded ? 'py-3' : 'py-0.5'}`}>
        {!isExpanded ? (
          // Collapsed state - thin bar
          <div className="text-center">
            <p className="text-[10px] text-teal-200">
              © {new Date().getFullYear()} University of Peradeniya - PGIS | Hover for contact info
            </p>
          </div>
        ) : (
          // Expanded state - full footer
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* University Logo and Name */}
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <img src={uopLogo} alt="UOP Logo" className="h-8 w-8 object-contain rounded" />
                  <h3 className="text-sm font-bold">University of Peradeniya</h3>
                </div>
                <p className="text-[10px] text-teal-100">
                  Postgraduate Institute of Science
                </p>
              </div>              {/* Address and Contact */}
              <div>
                <h4 className="text-xs font-semibold mb-0.5 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </h4>
                <div className="text-[10px] text-teal-100">
                  <p>P.O. Box 25, Peradeniya, Sri Lanka</p>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h4 className="text-xs font-semibold mb-0.5 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact
                </h4>
                <div className="text-[10px] text-teal-100 space-y-0.5">
                  <p>+94 81 2385660 | info@pgis.lk</p>
                  <p>FAX: +94 81 2389026</p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-2 pt-2 border-t border-teal-700 text-center">
              <p className="text-[10px] text-teal-200">
                © {new Date().getFullYear()} University of Peradeniya - PGIS. All rights reserved.
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  );
};

export default ContactInfo;
