import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-[#008080] text-white border-t-4 border-green-400">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    {/* PdfPivot Section */}
                    <div className="text-left">
                        <h3 className="text-base font-bold text-green-400 mb-4 uppercase tracking-wide">{t('footer.pdfpivot')}</h3>
                        <ul className="space-y-2">
                            <li><a href="/" className="hover:text-green-400 transition-colors text-white">{t('footer.home')}</a></li>
                            <li><a href="/login" className="hover:text-green-400 text-white">{t('footer.login')}</a></li>
                            <li><a href="/register" className="hover:text-green-400 transition-colors text-white">{t('footer.register')}</a></li>
                            <li><a href="/plans" className="hover:text-green-400 transition-colors text-white">{t('footer.plans')}</a></li>
                        </ul>
                    </div>
                    {/* Product */}
                    <div className="text-left">
                        <h3 className="text-base font-bold text-green-400 mb-4 uppercase tracking-wide">{t('footer.services')}</h3>
                        <ul className="space-y-2">
                            <li><a href="/merge-pdf" className="hover:text-green-400 text-white transition-colors">{t('footer.merge_pdf')}</a></li>
                            <li><a href="/split-pdf" className="hover:text-green-400 text-white transition-colors">{t('footer.split_pdf')}</a></li>
                            <li><a href="/remove-pages" className="hover:text-green-400 text-white transition-colors">{t('footer.remove_pages')}</a></li>
                            <li><a href="/extract-pages" className="hover:text-green-400 text-white transition-colors">{t('footer.extract_pages')}</a></li>
                        </ul>
                    </div>
                    {/* Solutions */}
                    <div className="text-left">
                        <h3 className="text-base font-bold text-green-400 mb-4 uppercase tracking-wide">{t('footer.security_tools')}</h3>
                        <ul className="space-y-2">
                            <li><a href="/update-metadata" className="hover:text-green-400 text-white transition-colors">{t('footer.update_metadata')}</a></li>
                            <li><a href="/view-metadata" className="hover:text-green-400 text-white transition-colors">{t('footer.view_metadata')}</a></li>
                            <li><a href="/add-watermark" className="hover:text-green-400 text-white transition-colors">{t('footer.add_watermark')}</a></li>
                            <li><a href="/protect-pdf" className="hover:text-green-400 text-white transition-colors">{t('footer.protect_pdf')}</a></li>
                        </ul>
                    </div>
                    {/* Company */}
                    <div className="text-left">
                        <h3 className="text-base font-bold text-green-400 mb-4 uppercase tracking-wide">{t('footer.company')}</h3>
                        <ul className="space-y-2">
                            <li><Link to="/privacy-policy" className="hover:text-gold text-white transition-colors">{t('footer.privacy_policy')}</Link></li>
                            <li><Link to="/terms-conditions" className="hover:text-gold text-white transition-colors">{t('footer.terms_conditions')}</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-gold text-white transition-colors">{t('footer.refund_policy')}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 flex flex-col items-center border-t border-gold pt-6">
                    <p className="text-sm text-white text-center">{t('footer.copyright')}</p>
                    <div className="flex space-x-4 mt-4 justify-center">
                        {/* Facebook */}
                        <a href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Facebook">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                            </svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="#" className="text-white hover:text-green-400 transition-colors" aria-label="LinkedIn">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597z" />
                            </svg>
                        </a>
                        {/* Twitter */}
                        <a href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Twitter">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.142 0 14.307-7.721 13.995-14.646A9.936 9.936 0 0 0 24 4.557z" />
                            </svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Instagram">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5a4.25 4.25 0 0 1-4.25 4.25h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm4.25 2.75a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm5.25.75a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
      </footer>
    );
  };
  
  export default Footer;
  