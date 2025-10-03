import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planId, paymentType, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        setProcessing(false);
        return;
      }

      // Handle successful payment
      await axios.post('/api/payments/payment-success', {
        paymentIntentId: paymentIntent.id
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || t('payment_form.default_error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <PaymentElement />
      {error && (
        <div className="mt-4 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {t('payment_form.cancel')}
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing ? t('payment_form.processing') : t('payment_form.pay_now')}
        </button>
      </div>
    </form>
  );
};

const PaymentForm = ({ planId, paymentType, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const { data } = await axios.post('/api/payments/create-payment-intent', {
          planId,
          paymentType
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
      }
    };

    fetchPaymentIntent();
  }, [planId, paymentType]);

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        planId={planId}
        paymentType={paymentType}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default PaymentForm; 