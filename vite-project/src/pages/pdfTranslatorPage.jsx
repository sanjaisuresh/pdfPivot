import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const PdfTranslatorPage = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [translatedUrl, setTranslatedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetLang, setTargetLang] = useState("en");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setSelectedFileName(file.name);
      setTranslatedUrl(null);
      setError(null);
    } else {
      setError(t("pdftranslator.invalid_pdf"));
    }
  };

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
         const trackRes = await axios.post('/api/user/track', {
        service: 'translate',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("lang", targetLang);

      const res = await axios.post("/api/translate", formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setTranslatedUrl(url);
    } catch (err) {
      console.error(err);
      setError(t("pdftranslator.translation_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">
            {t("pdftranslator.smart_pdf_translator")}
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("pdftranslator.smart_pdf_translator_desc")}
          </p>
        </div>

        {/* Translator Box */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleTranslate} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdftranslator.upload_pdf")}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <input
                        id="file-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        {t("pdftranslator.upload_a_file")}
                      </label>
                      <p className="text-xs text-gray-500">{t("pdftranslator.pdf_formats")}</p>
                      {selectedFileName && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          {t("pdftranslator.selected")}: {selectedFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Language Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdftranslator.select_language")}
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="it">Italiano</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="nl">Nederlands</option>
                    <option value="pl">Polski</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>

                {/* Translate Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !pdfFile}
                    className={`px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200 ${
                      loading || !pdfFile
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                  >
                    {loading
                      ? t("pdftranslator.translating")
                      : t("pdftranslator.translate_pdf")}
                  </button>
                </div>
              </form>

              {/* Result */}
              {translatedUrl && (
                <div className="mt-6 text-center">
                  {/* <iframe
                    src={translatedUrl}
                    title="Translated PDF"
                    className="w-full h-96 border rounded-lg"
                  ></iframe> */}
                  <a
                    href={translatedUrl}
                    download="translated.pdf"
                    className="mt-3 inline-block px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 hover:scale-105"
                  >
                    {t("pdftranslator.download_translated")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTranslatorPage;