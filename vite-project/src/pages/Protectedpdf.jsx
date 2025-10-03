import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaLock, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const PdfProtectionPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
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
    },
  });

  const handleProtect = async () => {
    if (!file || !password) {
      setError(t('protect_pdf.select_pdf_and_password'));
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
        service: 'protect-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/protect-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setConvertedFile(blob);
      toast.success(t('protect_pdf.success'));
    } catch (err) {
        console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('protect_pdf.failed'));
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
      link.download = 'protected.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
  <Helmet>
      {/* SEO Meta Tags */}
      <title>Add Protection to PDF Online | Secure Your Files</title>
      <meta
        name="description"
        content="Add protection to PDF with PDFPivot. Encrypt your files with a password to prevent unauthorized access. 100% free, secure, and easy—no sign-up needed."
      />

      {/* Open Graph (text-only) */}
      <meta
        property="og:title"
        content="Add Protection to PDF Online | Secure Your Files"
      />
      <meta
        property="og:description"
        content="Add protection to PDF with PDFPivot. Encrypt your files with a password to prevent unauthorized access. 100% free, secure, and easy—no sign-up needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/protect-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:title"
        content="Add Protection to PDF Online | Secure Your Files"
      />
      <meta
        name="twitter:description"
        content="Add protection to PDF with PDFPivot. Encrypt your files with a password to prevent unauthorized access. 100% free, secure, and easy—no sign-up needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">{t('protect_pdf.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('protect_pdf.desc')}
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#E6F0FF] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_pdf')}</label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-600 transition-colors duration-200 cursor-pointer ${
                    isDragActive ? 'border-indigo-600 bg-indigo-100' : ''
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <FaFilePdf className="mx-auto h-12 w-12 text-indigo-600" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-700 hover:text-indigo-900">
                        {t('upload_pdf')}
                      </span>
                      <p className="pl-1">{t('or_drag_and_drop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t('pdf_up_to_20mb')}</p>
                    {file && (
                      <div className="mt-2">
                        <p className="text-sm text-indigo-700 font-medium">{t('protect_pdf.selected_file')}:</p>
                        <p className="text-sm text-gray-500">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input {...getInputProps()} className="sr-only" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('protect_pdf.set_password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('protect_pdf.password_placeholder')}
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleProtect}
                  disabled={!file || !password || loading}
                  className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    !file || !password || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('protect_pdf.protecting')}
                    </>
                  ) : (
                    <>
                      <FaLock className="mr-2" />
                      {t('protect_pdf.protect_btn')}
                    </>
                  )}
                </button>
              </div>

              {convertedFile && !loading && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 hover:scale-105"
                  >
                    <FaDownload className="w-5 h-5 mr-2" />
                    {t('protect_pdf.download_btn')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PdfProtectionPage;