import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{t('terms_conditions.title')}</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.acceptance.title')}</h2>
      <p>
        {t('terms_conditions.acceptance.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.eligibility.title')}</h2>
      <p>
        {t('terms_conditions.eligibility.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.services.title')}</h2>
      <p>
        {t('terms_conditions.services.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.account.title')}</h2>
      <p>
        {t('terms_conditions.account.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.acceptable_use.title')}</h2>
      <p>{t('terms_conditions.acceptable_use.intro')}</p>
      <ul className="list-disc list-inside">
        <li>{t('terms_conditions.acceptable_use.item1')}</li>
        <li>{t('terms_conditions.acceptable_use.item2')}</li>
        <li>{t('terms_conditions.acceptable_use.item3')}</li>
        <li>{t('terms_conditions.acceptable_use.item4')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.intellectual_property.title')}</h2>
      <p>
        {t('terms_conditions.intellectual_property.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.user_content.title')}</h2>
      <p>
        {t('terms_conditions.user_content.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.payment.title')}</h2>
      <p>
        {t('terms_conditions.payment.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.refund.title')}</h2>
      <p>
        {t('terms_conditions.refund.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.liability.title')}</h2>
      <p>
        {t('terms_conditions.liability.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.warranties.title')}</h2>
      <p>
        {t('terms_conditions.warranties.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.third_party.title')}</h2>
      <p>
        {t('terms_conditions.third_party.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.termination.title')}</h2>
      <p>
        {t('terms_conditions.termination.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.modifications.title')}</h2>
      <p>
        {t('terms_conditions.modifications.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('terms_conditions.contact.title')}</h2>
      <p>{t('terms_conditions.contact.intro')}</p>
      <ul className="list-disc list-inside">
        <li>{t('terms_conditions.contact.email')}: <a href="mailto:support@pdfpivot.com" className="text-blue-600 underline">support@pdfpivot.com</a></li>
        <li>{t('terms_conditions.contact.website')}: <a href="https://www.pdfpivot.com" className="text-blue-600 underline">www.pdfpivot.com</a></li>
      </ul>
    </div>
  );
};

export default TermsOfService;
