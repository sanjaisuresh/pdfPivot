import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{t('privacy_policy.title')}</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.introduction.title')}</h2>
      <p>
        {t('privacy_policy.introduction.content')} <a href="https://www.pdfpivot.com" className="text-blue-600 underline">www.pdfpivot.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.information_collection.title')}</h2>
      <p>
        {t('privacy_policy.information_collection.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.how_we_use.title')}</h2>
      <ul className="list-disc list-inside">
        <li>{t('privacy_policy.how_we_use.item1')}</li>
        <li>{t('privacy_policy.how_we_use.item2')}</li>
        <li>{t('privacy_policy.how_we_use.item3')}</li>
        <li>{t('privacy_policy.how_we_use.item4')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.legal_basis.title')}</h2>
      <p>
        {t('privacy_policy.legal_basis.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.cookies.title')}</h2>
      <p>
        {t('privacy_policy.cookies.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.uploaded_files.title')}</h2>
      <p>
        {t('privacy_policy.uploaded_files.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.third_party.title')}</h2>
      <p>
        {t('privacy_policy.third_party.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.data_security.title')}</h2>
      <p>
        {t('privacy_policy.data_security.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.data_retention.title')}</h2>
      <p>
        {t('privacy_policy.data_retention.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.international_transfers.title')}</h2>
      <p>
        {t('privacy_policy.international_transfers.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.children_privacy.title')}</h2>
      <p>
        {t('privacy_policy.children_privacy.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.your_rights.title')}</h2>
      <p>
        {t('privacy_policy.your_rights.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.third_party_links.title')}</h2>
      <p>
        {t('privacy_policy.third_party_links.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.policy_updates.title')}</h2>
      <p>
        {t('privacy_policy.policy_updates.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('privacy_policy.contact.title')}</h2>
      <p>{t('privacy_policy.contact.intro')}</p>
      <ul className="list-disc list-inside">
        <li>{t('privacy_policy.contact.email')}: <a href="mailto:support@pdfpivot.com" className="text-blue-600 underline">support@pdfpivot.com</a></li>
        <li>{t('privacy_policy.contact.website')}: <a href="https://www.pdfpivot.com" className="text-blue-600 underline">www.pdfpivot.com</a></li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
