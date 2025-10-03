import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const PdfExpiryPage = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [shareLink, setShareLink] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7); // default expiry days

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setSelectedFileName(file.name);
      setShareLink(null);
      setError(null);
    } else {
      setError(t("pdfexpiry.invalid_pdf"));
    }
  };

  const handleUpload = async (e) => {
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
        service: 'pdf-expirep',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("days", days);

      const res = await axios.post("/api/pdf-expire", formData);
      setShareLink(res.data?.url);
      setExpiryDate(res.data?.expiresAt);
    } catch (err) {
      console.error(err);
      setError(t("pdfexpiry.failed"));
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
            {t("pdfexpiry.upload_pdf_title")}
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("pdfexpiry.desc")}
          </p>
        </div>

        {/* Upload Box */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#FFF9F2] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleUpload} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdfexpiry.upload_pdf")}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-teal-500 transition-colors duration-200">
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
                        className="cursor-pointer text-teal-600 hover:text-teal-500 font-medium"
                      >
                        {t("pdfexpiry.upload_a_file")}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t("pdfexpiry.pdf_formats")}
                      </p>
                      {selectedFileName && (
                        <p className="mt-2 text-sm text-teal-600 font-medium">
                          {t("pdfexpiry.selected")}: {selectedFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expiry Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdfexpiry.expiry_days")}
                  </label>
                  <input
                    type="number"
                    value={days}
                    min="1"
                    max="30"
                    onChange={(e) => setDays(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">
                    {t("pdfexpiry.days_note")}
                  </span>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !pdfFile}
                    className={`px-6 py-3 rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-200 ${
                      loading || !pdfFile
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                  >
                    {loading
                      ? t("pdfexpiry.uploading")
                      : t("pdfexpiry.upload_pdf_btn")}
                  </button>
                </div>
              </form>

              {/* Result */}
              {shareLink && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {t("pdfexpiry.link_expires")}:{" "}
                    <span className="font-medium text-red-500">
                      {new Date(expiryDate).toLocaleString()}
                    </span>
                  </p>
                  <a
                    href={shareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 hover:scale-105"
                  >
                    {t("pdfexpiry.open_pdf")}
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

export default PdfExpiryPage;
