import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { Helmet } from 'react-helmet';

const PdfToPdfaPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setConvertedFile(null);
        setError(null);
      }
    }
  });

  const handleConvert = async () => {
    if (!file) {
      setError(t('pdf_to_pdfa.select_pdf'));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t("please_login"));
      setLoading(false);
      return;
    }
    try {
      const trackRes = await axios.post('/api/user/track', {
        service: 'pdf-to-pdfa',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/pdf-to-pdfa', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setConvertedFile(blob);
      toast.success(t('pdf_to_pdfa.success'));
    } catch (err) {
      console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t("please_login"));
      } else if (err.response?.status === 403) {
        setError(t("limit_reached"));
      } else {
        setError(t("pdf_to_pdfa.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const url = URL.createObjectURL(convertedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_pdfa.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
    <Helmet>
      {/* Primary SEO Meta Tags */}
      <title>Convert PDF to PDF/A Online | Free & Easy Tool</title>
      <meta
        name="description"
        content="Convert PDF to PDF/A format with PDFPivot. Ensure long-term archiving of documents. Fast, secure, and free—no sign-up or software download needed."
      />

      {/* Open Graph (text-only) */}
      <meta
        property="og:title"
        content="Convert PDF to PDF/A Online | Free & Easy Tool"
      />
      <meta
        property="og:description"
        content="Convert PDF to PDF/A format with PDFPivot. Ensure long-term archiving of documents. Fast, secure, and free—no sign-up or software download needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/pdf-to-pdfa" />

      {/* Twitter Card (text-only) */}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:title"
        content="Convert PDF to PDF/A Online | Free & Easy Tool"
      />
      <meta
        name="twitter:description"
        content="Convert PDF to PDF/A format with PDFPivot. Ensure long-term archiving of documents. Fast, secure, and free—no sign-up or software download needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">{t('pdf_to_pdfa.title')}</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t('pdf_to_pdfa.desc')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload */}
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'} cursor-pointer`}>
              <input {...getInputProps()} className="sr-only" />
              <div className="text-center">
                <FaFilePdf className="mx-auto h-12 w-12 text-indigo-600" />
                <p className="text-sm text-gray-600">{t('pdf_to_pdfa.upload_text')}</p>
                {file && <p className="mt-2 text-sm text-gray-700">{file.name}</p>}
              </div>
            </div>

            {/* Convert button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className={`px-8 py-3 rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition duration-200 ${(!file || loading) && 'opacity-50 cursor-not-allowed'}`}
              >
                {loading ? t('pdf_to_pdfa.converting') : t('pdf_to_pdfa.convert_btn')}
              </button>
            </div>

            {/* Download button */}
            {convertedFile && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                >
                  <FaDownload className="inline-block mr-2" />
                  {t('pdf_to_pdfa.download_btn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PdfToPdfaPage;