import { useState } from 'react';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const UnlockPdfPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError(t('unlock_pdf_page.please_upload_pdf'));
      toast.error(t('unlock_pdf_page.please_upload_pdf'));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleUnlock = async () => {
    if (!file) {
      setError(t('unlock_pdf_page.please_upload_pdf'));
      toast.error(t('unlock_pdf_page.please_upload_pdf'));
      return;
    }

    if (!password) {
      setError(t('unlock_pdf_page.please_enter_password'));
      toast.error(t('unlock_pdf_page.please_enter_password'));
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);
   const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
            const trackRes = await axios.post('/api/user/track', {
        service: 'unlock-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/unlock-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('unlock_pdf_page.failed_unlock'));
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unlocked-${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('unlock_pdf_page.unlocked_successfully'));
      setFile(null);
      setPassword('');
    } catch (err) {
        console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('unlock_pdf_page.failed_unlock'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (<>
    <Helmet>
      {/* SEO Meta Tags */}
      <title>Unlock PDF Online Free | Remove Password Fast</title>
      <meta
        name="description"
        content="Unlock PDF files easily with PDFPivot. Remove password protection from secured PDFs in seconds. 100% free, fast, and secure—no sign-up required."
      />

      {/* Open Graph (text-only) */}
      <meta property="og:title" content="Unlock PDF Online Free | Remove Password Fast" />
      <meta
        property="og:description"
        content="Unlock PDF files easily with PDFPivot. Remove password protection from secured PDFs in seconds. 100% free, fast, and secure—no sign-up required."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/unlock-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Unlock PDF Online Free | Remove Password Fast" />
      <meta
        name="twitter:description"
        content="Unlock PDF files easily with PDFPivot. Remove password protection from secured PDFs in seconds. 100% free, fast, and secure—no sign-up required."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t('unlock_pdf_page.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('unlock_pdf_page.desc')}
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4EDE4] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('unlock_pdf_page.upload_label')}
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 ${
                      isDragActive ? 'border-gold bg-gold/5' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaLock className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          <span>{t('upload_pdf_file')}</span>
                          <input {...getInputProps()} className="sr-only" />
                        </label>
                        <p className="pl-1">{t('or_drag_and_drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t('pdf_up_to_20mb')}</p>
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          {t('selected_file', { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                {file && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('unlock_pdf_page.pdf_password')}
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('unlock_pdf_page.enter_password_placeholder')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
                    />
                  </div>
                )}

                {/* Unlock Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUnlock}
                    disabled={!file || loading}
                    className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-forest hover:bg-gold hover:text-forest transition duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
                      !file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('unlock_pdf_page.unlocking')}
                      </>
                    ) : (
                      <>
                        <FaUnlock className="mr-2" />
                        {t('unlock_pdf_page.unlock_pdf_btn')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default UnlockPdfPage; 