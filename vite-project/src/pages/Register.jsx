import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
    favBook: '',      // First security question answer
    favMeal: ''       // Second security question answer
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwords_do_not_match'));
      return;
    }

    const result = await register(
      formData.email, 
      formData.password, 
      formData.name,
      formData.favBook,
      formData.favMeal,
      formData.country
    );

    if (result.success) {
      if(result?.data?.user?.isAdmin){
      window.location.replace('/admin');
      }
      else{
        window.location.replace('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('register.title')}</h2>
          <p className="text-gray-600 text-lg">{t('register.subtitle')}</p>
        </div>

        {/* Register Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('register.full_name')}
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                    placeholder={t('register.full_name_placeholder')}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('register.email_label')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                    placeholder={t('register.email_placeholder')}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('register.password_label')}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                    placeholder={t('register.password_placeholder')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('register.confirm_password_label')}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                    placeholder={t('register.confirm_password_placeholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
    {t('register.country_label')}
  </label>
  <div className="mt-1">
    <select
      id="country"
      name="country"
      required
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={formData.country}
      onChange={handleChange}
    >
      <option value="">{t('register.select_country')}</option>
      {[
        "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina",
        "Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados",
        "Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina",
        "Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
        "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros",
        "Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic (Czechia)",
        "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
        "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. " +
        "Swaziland)","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany",
        "Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti",
        "Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
        "Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
        "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
        "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
        "Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro",
        "Morocco","Mozambique","Myanmar (formerly Burma)","Namibia","Nauru","Nepal","Netherlands",
        "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
        "Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru",
        "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis",
        "Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
        "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia",
        "Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain",
        "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
        "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
        "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom",
        "United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
        "Vietnam","Yemen","Zambia","Zimbabwe"
      ].map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  </div>
</div>


              {/* Security Questions */}
              <div>
                <label htmlFor="favBook" className="block text-sm font-medium text-gray-700">
                  {t('register.fav_book_question')}
                </label>
                <div className="mt-1">
                  <input
                    id="favBook"
                    name="favBook"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('register.fav_book_placeholder')}
                    value={formData.favBook}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="favMeal" className="block text-sm font-medium text-gray-700">
                  {t('register.fav_meal_question')}
                </label>
                <div className="mt-1">
                  <input
                    id="favMeal"
                    name="favMeal"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={t('register.fav_meal_placeholder')}
                    value={formData.favMeal}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-200 hover:scale-105"
              >
                {t('register.create_account_btn')}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {t('register.already_have_account')}{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200">
                  {t('register.sign_in_link')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 