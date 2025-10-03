import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { Helmet } from 'react-helmet';

const PdfMetadataViewer = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setMetadata(null);
        setError(null);
      }
    }
  });

  const handleViewMetadata = async () => {
    if (!file) {
      setError(t('metadata_viewer.select_pdf'));
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
        service: 'view-metadata',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + '/api/view-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMetadata(data.metadata);
      toast.success(t('metadata_viewer.success'));
    } catch (err) {
      console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t("please_login"));
      } else if (err.response?.status === 403) {
        setError(t("limit_reached"));
      } else {
        setError(t("metadata_viewer.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>PDF Metadata Viewer Online | View File Info Free</title>
      <meta
        name="description"
        content="Use PDFPivot’s PDF Metadata Viewer to check author, title, subject & more. Fast, secure, and 100% free—no installation or sign-up required."
      />

      {/* Open Graph (no image) */}
      <meta property="og:title" content="PDF Metadata Viewer Online | View File Info Free" />
      <meta
        property="og:description"
        content="Use PDFPivot’s PDF Metadata Viewer to check author, title, subject & more. Fast, secure, and 100% free—no installation or sign-up required."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/view-metadata" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="PDF Metadata Viewer Online | View File Info Free" />
      <meta
        name="twitter:description"
        content="Use PDFPivot’s PDF Metadata Viewer to check author, title, subject & more. Fast, secure, and 100% free—no installation or sign-up required."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-3xl font-bold text-center text-forest mb-4">{t('metadata_viewer.title')}</h1>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* File Upload */}
          <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-gold transition-colors ${isDragActive ? 'border-gold bg-gold/10' : 'border-gray-300'}`}>
            <FaFilePdf className="text-6xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">{t('metadata_viewer.upload_text')}</p>
            <input {...getInputProps()} className="sr-only" />
            {file && (
              <p className="mt-2 text-sm text-indigo-600">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
          </div>

          {/* View Metadata Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleViewMetadata}
              disabled={!file || loading}
              className="px-6 py-3 bg-forest text-white rounded-lg shadow hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {loading ? t('metadata_viewer.fetching') : t('metadata_viewer.view_btn')}
            </button>
          </div>

          {/* Display Metadata */}
          {metadata && (
            <div className="mt-6 bg-[#F4EDE4] rounded-lg p-4 overflow-x-auto">
              <h2 className="text-xl font-semibold mb-2">{t('metadata_viewer.metadata_label')}:</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PdfMetadataViewer;