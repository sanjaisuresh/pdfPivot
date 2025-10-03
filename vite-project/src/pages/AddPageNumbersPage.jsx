import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaHashtag } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import OperationTabsWrapper from '../components/TabWrapper';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const AddPageNumbersPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    position: 'bottom-center',
    format: 'Page {n} of {total}',
    fontSize: 12,
    color: '#000000',
    margin: 20
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: name === 'fontSize' || name === 'margin' ? Number(value) : value
    }));
  };

  const handleAddPageNumbers = async () => {
    if (!file) {
      setError(t('please_select_pdf'));
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('pdf', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
      await axios.post('/api/user/track', {
        service: 'add-page-numbers',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/add-page-numbers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType === 'application/pdf') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'numbered.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t('success_add_page_numbers'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error("Compression failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('failed_add_page_number'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Add Page Numbers to PDF Online | Free & Easy Tool</title>
      <meta
        name="description"
        content="Add page numbers to PDF with PDFPivot. Number your PDF pages in seconds. Fast, secure, and 100% free—no sign-up or software download required."
      />

      {/* Open Graph (text-only) */}
      <meta
        property="og:title"
        content="Add Page Numbers to PDF Online | Free & Easy Tool"
      />
      <meta
        property="og:description"
        content="Add page numbers to PDF with PDFPivot. Number your PDF pages in seconds. Fast, secure, and 100% free—no sign-up or software download required."
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content="https://www.pdfpivot.com/add-page-numbers"
      />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:title"
        content="Add Page Numbers to PDF Online | Free & Easy Tool"
      />
      <meta
        name="twitter:description"
        content="Add page numbers to PDF with PDFPivot. Number your PDF pages in seconds. Fast, secure, and 100% free—no sign-up or software download required."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t('add_page_numbers_title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('add_page_numbers_desc')}
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
                    {t('upload_pdf')}
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 cursor-pointer ${
                      isDragActive ? 'border-gold bg-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          {t('upload_pdf_file')}
                        </span>
                        <p className="pl-1">{t('or_drag_and_drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t('pdf_up_to_20mb')}</p>
                      {file && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">
                          {t('selected_file', { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) })}
                        </p>
                      )}
                    </div>
                    <input {...getInputProps()} className="sr-only" />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('position')}
                    </label>
                    <select
                      name="position"
                      value={options.position}
                      onChange={handleOptionChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    >
                      <option value="top-left">{t('top_left')}</option>
                      <option value="top-center">{t('top_center')}</option>
                      <option value="top-right">{t('top_right')}</option>
                      <option value="bottom-left">{t('bottom_left')}</option>
                      <option value="bottom-center">{t('bottom_center')}</option>
                      <option value="bottom-right">{t('bottom_right')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('format')}
                    </label>
                    <input
                      type="text"
                      name="format"
                      value={options.format}
                      onChange={handleOptionChange}
                      placeholder={t('format_placeholder')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('format_help')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('font_size')}
                    </label>
                    <input
                      type="number"
                      name="fontSize"
                      value={options.fontSize}
                      onChange={handleOptionChange}
                      min="8"
                      max="72"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('color')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="color"
                        value={options.color}
                        onChange={handleOptionChange}
                        className="h-8 w-8 rounded-md border border-gray-300"
                      />
                      <input
                        type="text"
                        name="color"
                        value={options.color}
                        onChange={handleOptionChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('margin')}
                    </label>
                    <input
                      type="number"
                      name="margin"
                      value={options.margin}
                      onChange={handleOptionChange}
                      min="0"
                      max="100"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Add Page Numbers Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAddPageNumbers}
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
                        {t('adding_page_numbers')}
                      </>
                    ) : (
                      <>
                        <FaHashtag className="mr-2" />
                        {t('add_page_numbers')}
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

export default AddPageNumbersPage; 