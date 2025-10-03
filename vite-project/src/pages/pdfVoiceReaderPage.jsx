import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const PdfVoiceReaderPage = () => {
  const { t } = useTranslation();
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setSelectedFileName(file.name);
      setAudioUrl(null);
      setError(null);
    } else {
      setError(t("pdfvoicereader.invalid_pdf"));
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await axios.post("pdfvoicereader./api/pdf-to-speech", formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setError(t("pdfvoicereader.conversion_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">
            {t("pdfvoicereader.pdf_voice_reader")}
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t("pdfvoicereader.pdf_voice_reader_desc")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleConvert} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("pdfvoicereader.upload_pdf")}
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
                        {t("pdfvoicereader.upload_a_file")}
                      </label>
                      <p className="text-xs text-gray-500">{t("pdfvoicereader.pdf_formats")}</p>
                      {selectedFileName && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          {t("pdfvoicereader.selected")}: {selectedFileName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
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
                    {loading ? t("pdfvoicereader.converting") : t("pdfvoicereader.convert_to_audio")}
                  </button>
                </div>
              </form>

              {/* Audio Player */}
              {audioUrl && (
                <div className="mt-6 text-center">
                  <audio controls src={audioUrl} className="w-full" />
                  <a
                    href={audioUrl}
                    download="pdf_audio.mp3"
                    className="mt-3 inline-block px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 hover:scale-105"
                  >
                    {t("pdfvoicereader.download_audio")}
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

export default PdfVoiceReaderPage;
