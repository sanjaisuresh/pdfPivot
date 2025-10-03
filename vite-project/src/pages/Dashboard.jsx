import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    imagesProcessed: 0,
    remainingImages: 0,
    subscription: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUserStats();
  }, [location.pathname]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/user/stats');
      console.log("response.data",response.data);
      
      setUserStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch user statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-teal-600 mb-6">{t('dashboard')}</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{t('pdf_processed')}</dt>
                          <dd className="text-lg font-medium text-teal-600">{userStats.imagesProcessed}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <Link to='/payment-history' className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{t('payment_history.title')}</dt>
                          <dd className="text-xs font-small text-teal-600">{t('payment_history_desc')}</dd>
                        </dl>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{t('current_plan')}</dt>
                          <dd className="text-lg font-medium text-teal-600">
                            {userStats.subscription?.plan?.name || 'Free'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/"
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-teal-600">{t('convert_pdf')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('convert_pdf_desc')}</p>
                  </div>
                </Link>

                <Link
                  to="/"
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-teal-600">{t('compress_images')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('compress_images_desc')}</p>
                  </div>
                </Link>

                <Link
                  to="/plans"
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-teal-600">{t('upgrade_plan')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('upgrade_plan_desc')}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 