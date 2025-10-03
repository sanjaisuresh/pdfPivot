import { useState } from 'react';
import SubscriptionPlans from '../pages/SubscriptionPlans';
import { useTranslation } from 'react-i18next';

const DisplayPlans = () => {
  const { t } = useTranslation();
  const plans = [
    {
      name: "Basic Plan (Free)",
      monthly: "Free",
      annual: "Free",
      services: [
        { name: "All Services", quota: "3 Free Uses per Month" },
      ],
    },
    {
      name: "Developer Plan",
      monthly: "$4.99 / month",
      annual: "$47.90 / year (20% off)",
      services: [
        { name: "All Services", quota: "10 Free Uses per Month" },
      ],
    },
    {
      name: "Business Plan",
      monthly: "$6.99 / month",
      annual: "$67.10 / year (20% off)",
      services: [
        { name: "All Services", quota: "Unlimited Usage" },
      ],
    },
  ];

  return (
    <div id="pricing" className="px-6 py-12 bg-[#000000] border-t-4 border-forest">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-green-400 mb-4">
        {t('display_plans.title')}
      </h2>
      <p className="text-center text-white mb-10">
        {t('display_plans.desc')}
      </p>
      <SubscriptionPlans/>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
        {plans.map((plan, index) => (
          <div
            key={index}
            onClick={() => window.location.href = 'http://localhost:5173/plans'}
            className="bg-[#ffe5a9] border border-forest rounded-xl shadow p-8 hover:shadow-lg hover:border-gold transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <h3 className="text-xl font-semibold text-forest mb-3">
              {plan.name}
            </h3>
            <p className=" mb-2 text-black">
              Monthly: <span className="font-medium text-[#ff6666]">{plan.monthly}</span>
            </p>
            <p className="text-black mb-4">
              Annually: <span className="font-medium text-[#ff6666]">{plan.annual}</span>
            </p>

            <h4 className="text-forest font-semibold mb-2">
              Services:
            </h4>
            <ul className="text-black list-disc list-inside space-y-1 text-sm">
              {plan.services.map((service, idx) => (
                <li key={idx}>
                  {service.name} — {service.quota}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default DisplayPlans; 