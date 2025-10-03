import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const FAQSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: t('faq.convert_file.question'),
      answer: t('faq.convert_file.answer'),
    },
    {
      question: t('faq.limits.question'),
      answer: t('faq.limits.answer'),
    },
    {
      question: t('faq.security.question'),
      answer: t('faq.security.answer'),
    },
    {
      question: t('faq.mobile.question'),
      answer: t('faq.mobile.answer'),
    },
    {
      question: t('faq.formats.question'),
      answer: t('faq.formats.answer'),
    },
    {
      question: t('faq.ocr.question'),
      answer: t('faq.ocr.answer'),
    },
  ];

  return (
    <section className="w-full py-16 bg-[#FFF0F0] flex flex-col items-center ">
      <h2 className="text-3xl font-bold text-forest mb-8 text-center">{t('faq.title')}</h2>
      <div className="w-full max-w-2xl bg-[#525266] text-white rounded-xl shadow border border-forest divide-y divide-red-500">
        {faqs.map((faq, idx) => (
          <div key={idx}>
            <button
              className={`w-full text-left px-6 py-4 flex justify-between  text-white items-center focus:outline-none transition-colors ${
                openIndex === idx ? 'bg-red-500' : 'bg-[#525266]'
              }`}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            >
              <span className="text-white font-semibold">{faq.question}</span>
              <span className={`ml-4 transition-transform text-white ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-4 pt-2 text-white animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection; 