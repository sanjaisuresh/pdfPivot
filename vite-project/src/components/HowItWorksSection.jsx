import React from "react";
import { useTranslation } from 'react-i18next';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50  py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-forest mb-16">
          {t('how_it_works.title')}
        </h1>
        <div className="w-full flex justify-center ">
          <div className="flex flex-col md:flex-row bg-[#e12c12] items-center max-w-4xl w-full mx-auto p-8 rounded-xl shadow-lg" style={{ boxShadow: '0 4px 24px 0 #FFD70022' }}>
            {/* Illustration/Image */}
            <div className="flex-shrink-0 flex justify-center w-full md:w-auto mb-8 md:mb-0 md:mr-16">
              <img
                src="/image1.jpg"
                alt={t('how_it_works.image_alt')}
                className="w-56 h-56 object-contain rounded-lg shadow"
              />
            </div>
            {/* Text Content */}
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-gold mb-3">{t('how_it_works.subtitle')}</h3>
              <p className="text-white  font-semibold mb-4">
                {t('how_it_works.description')}
              </p>
              <ol className="list-decimal list-inside text-white  space-y-2 font-medium text-base">
                <li>{t('how_it_works.step1')}</li>
                <li>{t('how_it_works.step2')}</li>
                <li>{t('how_it_works.step3')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 