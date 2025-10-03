import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import {
  FaCalendarAlt,
  FaMoneyBill,
  FaChevronDown,
  FaChevronUp,
  FaReceipt
} from 'react-icons/fa';
import { BsCreditCard2BackFill } from 'react-icons/bs';
import { MdOutlinePayment } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';

const PaymentHistoryPage = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/payments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setPayments(res.data.payments);
      } catch (error) {
        console.error('❌ Failed to fetch payments:', error);
        if (error.response && error.response.status === 401) {
          setAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (authError)
    return (
      <div className="text-center text-red-600 mt-10">
        {t('payment_history.auth_error')}
      </div>
    );

  const toggleDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          💳 {t('payment_history.title')}
        </h1>
        <div className="space-y-6">
          {payments.map((p, idx) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
            >
              {/* Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center space-x-3">
                  <FaMoneyBill className="text-green-600 text-xl" />
                  <span className="text-lg font-semibold text-green-700">
                     ${(p.amount / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <FaCalendarAlt className="text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {moment(p.billingCycle.startDate).format('DD-MM-YYYY')} -{' '}
                    {moment(p.billingCycle.endDate).format('DD-MM-YYYY')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <MdOutlinePayment className="text-blue-600" />
                  <span className="text-sm font-medium capitalize text-blue-700">
                    {p.billingType} {t('payment_history.plan')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                  <AiOutlineUser className="text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {p.planId?.name || t('payment_history.not_available')}
                  </span>
                </div>

                <button
                  onClick={() => toggleDetails(idx)}
                  className="mt-4 md:mt-0 text-blue-600 hover:underline flex items-center"
                >
                  {expandedIndex === idx ? (
                    <>
                      {t('payment_history.hide_details')} <FaChevronUp className="ml-1" />
                    </>
                  ) : (
                    <>
                      {t('payment_history.more_details')} <FaChevronDown className="ml-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {expandedIndex === idx && (
                <div className="bg-gray-50 px-6 py-6 text-sm text-gray-700 space-y-4 animate-fadeIn transition duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-start">
                      <BsCreditCard2BackFill className="text-gray-600 mr-2 mt-1" />
                      <div>
                        <div className="font-medium">{t('payment_history.card')}</div>
                        <div className="text-gray-800">
                          {p.paymentMethod.brand?.toUpperCase()} ••••{' '}
                          {p.paymentMethod.last4}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaReceipt className="text-gray-600 mr-2 mt-1" />
                      <div>
                        <div className="font-medium">{t('payment_history.receipt')}</div>
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {t('payment_history.view_receipt')}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AiOutlineUser className="text-gray-600 mr-2 mt-1" />
                      <div>
                        <div className="font-medium">{t('payment_history.billing_name')}</div>
                        <div className="text-gray-800">
                          {p.billingDetails.name || t('payment_history.not_available')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MdOutlinePayment className="text-gray-600 mr-2 mt-1" />
                      <div>
                        <div className="font-medium">{t('payment_history.email')}</div>
                        <div className="text-gray-800">
                          {p.billingDetails.email || t('payment_history.not_available')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaCalendarAlt className="text-gray-600 mr-2 mt-1" />
                      <div>
                        <div className="font-medium">{t('payment_history.paid_on')}</div>
                        <div className="text-gray-800">
                          {moment(p.createdAt).format('DD-MM-YYYY hh:mm A')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
