import axios from "axios";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const HtmlToPdfPage = () => {
  const { t } = useTranslation();
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("converted");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!html.trim()) {
      toast.error(t("html_to_pdf.enter_html_content"));
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const trackRes = await axios.post('/api/user/track', {
        service: 'html-to-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch("/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, fileName }),
      });
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        // Try to parse error message from backend
        let errorMsg = t("html_to_pdf.failed_convert");
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } else {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }
      if (!contentType || !contentType.includes('application/pdf')) {
        const text = await response.text();
        throw new Error(t("html_to_pdf.server_error") + text);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "converted"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("html_to_pdf.download_success"));
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Convert HTML to PDF Online Free | Fast & Secure</title>
      <meta
        name="description"
        content="Easily convert HTML to PDF with PDFPivot. Turn web pages or HTML code into high-quality PDFs in seconds. 100% free, secure, and no sign-up needed."
      />

      {/* Open Graph (text-only) */}
      <meta property="og:title" content="Convert HTML to PDF Online Free | Fast & Secure" />
      <meta
        property="og:description"
        content="Easily convert HTML to PDF with PDFPivot. Turn web pages or HTML code into high-quality PDFs in seconds. 100% free, secure, and no sign-up needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/html-to-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Convert HTML to PDF Online Free | Fast & Secure" />
      <meta
        name="twitter:description"
        content="Easily convert HTML to PDF with PDFPivot. Turn web pages or HTML code into high-quality PDFs in seconds. 100% free, secure, and no sign-up needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t("HTML to PDF")}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("html_to_pdf.desc")}
          </p>
        </div>
        <div className="bg-[#F4EDE4] rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("html_to_pdf.html_content")}
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold min-h-[200px] font-mono"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder={t("html_to_pdf.html_placeholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("html_to_pdf.pdf_filename")}
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="converted"
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={loading}
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("html_to_pdf.converting")}
                </>
              ) : (
                t("html_to_pdf.convert_btn")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HtmlToPdfPage; 