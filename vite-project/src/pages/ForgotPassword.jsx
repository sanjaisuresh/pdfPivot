import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios';
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState({
    favBook: '',
    favMeal: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/auth/forgot-password/verify-email', { email });
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || t('forgot_password.email_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/forgot-password/verify-answers', {
        email,
        answers: [answers.favBook.toLowerCase(), answers.favMeal.toLowerCase()]
      });
      setStep(3);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || t('forgot_password.incorrect_answers'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError(t('forgot_password.passwords_do_not_match'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/forgot-password/reset', {
        email,
        newPassword,
      });
      navigate('/login', { state: { message: t('forgot_password.reset_success') } });
    } catch (err) {
      setError(err.response?.data?.error || t('forgot_password.failed_reset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('forgot_password.title')}</h2>
          <p className="text-gray-600 text-lg">
            {step === 1 && t('forgot_password.step1')}
            {step === 2 && t('forgot_password.step2')}
            {step === 3 && t('forgot_password.step3')}
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('forgot_password.email_label')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('forgot_password.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? t('forgot_password.checking') : t('forgot_password.continue')}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAnswersSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('forgot_password.fav_book')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('forgot_password.answer_placeholder')}
                    value={answers.favBook}
                    onChange={(e) => setAnswers({...answers, favBook: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('forgot_password.fav_meal')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('forgot_password.answer_placeholder')}
                    value={answers.favMeal}
                    onChange={(e) => setAnswers({...answers, favMeal: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('forgot_password.verify_answers')}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  {t('forgot_password.new_password')}
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('forgot_password.new_password_placeholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('forgot_password.confirm_password')}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('forgot_password.confirm_password_placeholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? t('forgot_password.resetting') : t('forgot_password.reset_password')}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              {t('forgot_password.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 