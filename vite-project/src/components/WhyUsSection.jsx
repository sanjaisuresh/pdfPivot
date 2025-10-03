import React from "react";
import { useTranslation } from 'react-i18next';

const WhyUsSection = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      title: t('why_us.feature1.title'),
      description: t('why_us.feature1.description'),
    },
    {
      title: t('why_us.feature2.title'),
      description: t('why_us.feature2.description'),
    },
    {
      title: t('why_us.feature3.title'),
      description: t('why_us.feature3.description'),
    },
  ];

  return (
    <section className="bg-[#FFF9E5] border-t-4 border-gold py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-forest mb-16">
          {t('why_us.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 ">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center px-4 bg-[#cbbeb5] border border-forest rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-black text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
