import { useTranslation } from "react-i18next";

const RefundCancellationPolicy = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{t('refund_policy.title')}</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.no_refund.title')}</h2>
      <p>
        {t('refund_policy.no_refund.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.instant_service.title')}</h2>
      <p>
        {t('refund_policy.instant_service.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.order_cancellation.title')}</h2>
      <p>
        {t('refund_policy.order_cancellation.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.wrong_file.title')}</h2>
      <p>
        {t('refund_policy.wrong_file.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.duplicate_payments.title')}</h2>
      <p>
        {t('refund_policy.duplicate_payments.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.failed_services.title')}</h2>
      <p>
        {t('refund_policy.failed_services.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.user_mistakes.title')}</h2>
      <p>
        {t('refund_policy.user_mistakes.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.subscription_services.title')}</h2>
      <p>
        {t('refund_policy.subscription_services.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.unauthorized_use.title')}</h2>
      <p>
        {t('refund_policy.unauthorized_use.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.file_retention.title')}</h2>
      <p>
        {t('refund_policy.file_retention.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.service_downtime.title')}</h2>
      <p>
        {t('refund_policy.service_downtime.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.promotional_purchases.title')}</h2>
      <p>
        {t('refund_policy.promotional_purchases.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.chargebacks.title')}</h2>
      <p>
        {t('refund_policy.chargebacks.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.policy_agreement.title')}</h2>
      <p>
        {t('refund_policy.policy_agreement.content')}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{t('refund_policy.contact.title')}</h2>
      <p>{t('refund_policy.contact.intro')}</p>
      <ul className="list-disc list-inside">
        <li>{t('refund_policy.contact.email')}: <a href="mailto:support@pdfpivot.com" className="text-blue-600 underline">support@pdfpivot.com</a></li>
        <li>{t('refund_policy.contact.website')}: <a href="https://www.pdfpivot.com" className="text-blue-600 underline">www.pdfpivot.com</a></li>
      </ul>
    </div>
  );
};

export default RefundCancellationPolicy;
