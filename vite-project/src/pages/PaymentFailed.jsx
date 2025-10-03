import React from 'react';
import { useTranslation } from "react-i18next";

const PaymentFailedPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-xl w-full text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
          alt={t('payment_failed.alt_text')}
          className="w-24 h-24 mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-red-600">{t('payment_failed.title')}</h2>
        <p className="text-gray-600 mt-2">
          {t('payment_failed.description')}
        </p>

        <div className="mt-8 text-gray-700">
          <p>{t('payment_failed.try_again')}</p>
          <a
            href="/dashboard"
            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            {t('payment_failed.go_to_dashboard')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
