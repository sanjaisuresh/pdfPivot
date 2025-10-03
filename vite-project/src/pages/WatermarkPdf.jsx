// components/PdfWatermarkPage.js

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const PdfWatermarkPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedFile, setWatermarkedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setWatermarkedFile(null);
        setError(null);
      }
    }
  });

  const handleWatermark = async () => {
    if (!file) {
      setError(t('watermark_pdf.please_select_pdf'));
      return;
    }
    if (!watermarkText.trim()) {
      setError(t('watermark_pdf.please_enter_watermark'));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('watermark', watermarkText);
   const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
            const trackRes = await axios.post('/api/user/track', {
        service: 'add-watermark',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/pdf-watermark', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setWatermarkedFile(blob);
      toast.success(t('watermark_pdf.success'));
    } catch (err) {
        console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('watermark_pdf.failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (watermarkedFile) {
      const url = URL.createObjectURL(watermarkedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watermarked.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Add Watermark to PDF Online | Free & Easy Tool</title>
      <meta
        name="description"
        content="Add watermark to PDF with PDFPivot. Insert text or image watermarks in seconds. Fast, secure, and 100% free—no sign-up or software download needed."
      />

      {/* Open Graph (text-only) */}
      <meta
        property="og:title"
        content="Add Watermark to PDF Online | Free & Easy Tool"
      />
      <meta
        property="og:description"
        content="Add watermark to PDF with PDFPivot. Insert text or image watermarks in seconds. Fast, secure, and 100% free—no sign-up or software download needed."
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content="https://www.pdfpivot.com/add-watermark"
      />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:title"
        content="Add Watermark to PDF Online | Free & Easy Tool"
      />
      <meta
        name="twitter:description"
        content="Add watermark to PDF with PDFPivot. Insert text or image watermarks in seconds. Fast, secure, and 100% free—no sign-up or software download needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">{t('watermark_pdf.title')}</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t('watermark_pdf.desc')}
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
                <p className="text-sm text-gray-600">{t('watermark_pdf.upload_text')}</p>
                {file && <p className="mt-2 text-sm text-gray-700">{file.name}</p>}
              </div>
            </div>

            {/* Watermark input */}
            <div className="mt-4">
              <label htmlFor="watermark" className="block text-sm font-medium text-gray-700 mb-1">
                {t('watermark_pdf.watermark_text')}
              </label>
              <input
                id="watermark"
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t('watermark_pdf.watermark_placeholder')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Add watermark button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleWatermark}
                disabled={!file || loading}
                className={`px-8 py-3 rounded-lg text-white bg-indigo-700 hover:bg-indigo-800 transition duration-200 ${(!file || loading) && 'opacity-50 cursor-not-allowed'}`}
              >
                {loading ? t('watermark_pdf.adding') : t('watermark_pdf.add_watermark')}
              </button>
            </div>

            {/* Download button */}
            {watermarkedFile && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                >
                  <FaDownload className="inline-block mr-2" />
                  {t('watermark_pdf.download_watermarked')}
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

export default PdfWatermarkPage;