import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const HandwritingPdfPage = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [handwrittenUrl, setHandwrittenUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setSelectedFileName(file.name);
      setHandwrittenUrl(null);
      setError(null);
    } else {
      setError(t("pdfhandwriter.invalid_pdf"));
    }
  };

  const handleHandwrite = async (e) => {
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
        service: 'handwriting',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await axios.post("/api/handwrite", formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setHandwrittenUrl(url);
    } catch (err) {
      console.error(err);
      setError(t("pdfhandwriter.failed"));
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
            {t("pdfhandwriter.handwriting_simulation")}
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("pdfhandwriter.desc")}
          </p>
        </div>

        {/* Handwriting Box */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#FFF9F2] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleHandwrite} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdfhandwriter.upload_pdf")}
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
                        {t("pdfhandwriter.upload_a_file")}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t("pdfhandwriter.pdf_formats")}
                      </p>
                      {selectedFileName && (
                        <p className="mt-2 text-sm text-teal-600 font-medium">
                          {t("pdfhandwriter.selected")}: {selectedFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Simulate Button */}
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
                      ? t("pdfhandwriter.simulating")
                      : t("pdfhandwriter.simulate_pdf")}
                  </button>
                </div>
              </form>

              {/* Result */}
              {handwrittenUrl && (
                <div className="mt-6 text-center">
                  <iframe
                    src={handwrittenUrl}
                    title="Handwritten PDF"
                    className="w-full h-96 border rounded-lg"
                  ></iframe>
                  <a
                    href={handwrittenUrl}
                    download="handwritten.pdf"
                    className="mt-3 inline-block px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 hover:scale-105"
                  >
                    {t("pdfhandwriter.download_handwritten")}
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

export default HandwritingPdfPage;
