import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import {
  FaSearch, FaCalendarAlt, FaMoneyBillAlt, FaChevronDown, FaChevronUp,
  FaUserAlt, FaCreditCard, FaReceipt, FaFilter, FaDownload
} from 'react-icons/fa';

const AdminPaymentDashboard = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ email: '', plan: '', from: '', to: '' });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setPayments(res.data.payments);

      // Calculate total
      const total = res.data.payments.reduce((sum, p) => sum + p.amount, 0);
      setTotalAmount(total);
    } catch (err) {
      console.error('Failed to fetch admin payments:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🧾 {t('admin_payment_dashboard')}</h1>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold">{t('user_email')}</label>
            <input
              type="text"
              placeholder={t('user_email_placeholder')}
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">{t('plan_name')}</label>
            <input
              type="text"
              placeholder={t('plan_name_placeholder')}
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">{t('from_date')}</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">{t('to_date')}</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
            />
          </div>
          <div className="col-span-full flex justify-end mt-2">
            <button
              type="submit"
              className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <FaFilter className="mr-2" /> {t('apply_filters')}
            </button>
          </div>
        </form>

        {/* Total Amount Summary */}
        <div className="mb-6 text-right text-lg font-medium text-green-700">
          💰 {t('total_collection')}: ${ (totalAmount / 100).toFixed(2) }
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Payment List */}
            {payments.map((p, idx) => (
              <div key={p._id} className="bg-white shadow rounded-xl mb-4 border border-gray-200 transition hover:shadow-lg">
                <div className="grid md:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 items-center">
                  <div className="flex items-center space-x-2">
                    <FaMoneyBillAlt className="text-green-600" />
                    <span className="text-lg font-semibold text-green-700">${(p.amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 space-x-1">
                    <FaCalendarAlt />
                    <span>{moment(p.createdAt).format('DD-MM-YYYY')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 space-x-1">
                    <FaUserAlt />
                    <span>{p.userId?.name} ({p.userId?.email})</span>
                  </div>
                  <div className="text-sm text-indigo-700 font-medium capitalize">
                    {p.billingType} – {p.planId?.name}
                  </div>
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-sm text-indigo-600 hover:underline flex items-center justify-end"
                  >
                    {expanded === idx ? <>{t('hide')} <FaChevronUp className="ml-1" /></> : <>{t('details')} <FaChevronDown className="ml-1" /></>}
                  </button>
                </div>

                {expanded === idx && (
                  <div className="px-6 py-4 bg-gray-50 text-sm text-gray-700 space-y-2">
                    <div className="flex items-center"><FaCreditCard className="mr-2 text-indigo-600" /> {t('card')}: {p.paymentMethod.brand?.toUpperCase()} **** {p.paymentMethod.last4}</div>
                    <div className="flex items-center">
                      <FaReceipt className="mr-2 text-indigo-600" />
                      {t('receipt')}:
                      <a
                        className="ml-2 inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload className="mr-1" /> {t('view_receipt')}
                      </a>
                    </div>
                    <div className="flex items-center"><FaUserAlt className="mr-2 text-indigo-600" /> {t('billing_name')}: {p.billingDetails.name}</div>
                    <div className="flex items-center"><FaUserAlt className="mr-2 text-indigo-600" /> {t('email')}: {p.billingDetails.email}</div>
                    {p.userId?.country && <div className="flex items-center"><FaUserAlt className="mr-2 text-indigo-600" /> {t('country')}: {p.userId?.country || "NA"}</div>}
                    <div className="flex items-center"><FaCalendarAlt className="mr-2 text-indigo-600" /> {t('billing_cycle')}: {moment(p.billingCycle.startDate).format('DD-MM-YYYY')} → {moment(p.billingCycle.endDate).format('DD-MM-YYYY')}</div>
                  </div>
                )}
              </div>
            ))}

            {!payments.length && (
              <div className="text-center mt-10 text-gray-600">
                <FaSearch className="inline-block text-xl mr-1" />
                {t('no_payments_found')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentDashboard;
