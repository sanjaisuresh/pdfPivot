import { useState } from 'react';
import PaymentForm from './PaymentForm';

const PlanCard = ({ plan, currentPlan, onSuccess }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState('monthly');
  
  const handleSelectPlan = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onSuccess();
  };

  const handleCancel = () => {
    setShowPayment(false);
  };

  const isCurrentPlan = currentPlan === plan.name;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-4 flex items-baseline">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                ${plan.monthlyFee}
              </span>
              <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>or ${plan.annualFee}/year (save ${plan.monthlyFee * 12 - plan.annualFee})</span>
            </div>
          </div>
        </div>
        
        <ul className="mt-6 space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>

        {!showPayment ? (
          <div className="mt-8">
            {isCurrentPlan ? (
              <button
                disabled
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-md"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleSelectPlan}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Select Plan
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Period
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentType('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    paymentType === 'monthly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPaymentType('annual')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    paymentType === 'annual'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>
            <PaymentForm
              planId={plan._id}
              paymentType={paymentType}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard; 