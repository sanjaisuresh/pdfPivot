import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = {
  "PDF Page Management": [],
  "Format Conversions (To PDF)": [],
  "Format Conversions (From PDF)": [],
  "Security & Watermarking": [],
  "eDocs,eForms & eSignatures":[],
  "Pdf Translate":[]
};

const OperationTabsWrapper = ({ children }) => {
  const {activeCategory, setActiveCategory} = useAuth()
const navigate=useNavigate()
  const location = useLocation();

const handleClick=(cat)=>{
    setActiveCategory(cat)
    if(location.pathname!=='/'){
        navigate('/')
    }
}
  return (
    <div className='py-8 px-2'>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-forest rounded-lg">
      <div className="mx-auto">
        {/* Tabs */}
        <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap mb-10  scrollbar-hide  md:justify-center">
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              className={`px-4 py-2 md:py-4 text-sm md:text-base font-semibold  focus:outline-none transition duration-200 min-w-[250px] md:min-w-[150px] mx-1 md:mx-0 shadow-sm border-b-4 md:border-b-0 ${
                activeCategory !== cat
                  ? "bg-[#008080] text-white border border-gray-300 border-b-4 border-b-transparent hover:bg-[#009999]"
                  : "bg-gray-50 text-[#008080]  shadow-md"
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Children content passed as render function */}
        <div className="">
          {children}
        </div>
      </div>
    </div>
    </div>
  );
};

export default OperationTabsWrapper;
