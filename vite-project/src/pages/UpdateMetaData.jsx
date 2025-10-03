import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const UpdateMetadataPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [updatedFile, setUpdatedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setUpdatedFile(null);
        setError(null);
      }
    }
  });

  const handleUpdate = async () => {
    if (!file) {
      setError(t('update_metadata_page.please_select_pdf'));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', metadata.title);
    formData.append('author', metadata.author);
    formData.append('subject', metadata.subject);
    formData.append('keywords', metadata.keywords);
   const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
            const trackRes = await axios.post('/api/user/track', {
        service: 'update-metadata',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + '/api/update-metadata', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setUpdatedFile(blob);
      toast.success(t('update_metadata_page.updated_successfully'));
    } catch (err) {
        console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('update_metadata_page.failed_update'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (updatedFile) {
      const url = URL.createObjectURL(updatedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'updated.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
  <Helmet>
      {/* SEO Meta Tags */}
      <title>Update PDF Metadata Online | Edit Info for Free</title>
      <meta
        name="description"
        content="Easily update PDF metadata online with PDFPivot. Edit title, author, keywords & more. Fast, secure, and 100% free—no sign-up or software needed."
      />

      {/* Open Graph (text-only) */}
      <meta property="og:title" content="Update PDF Metadata Online | Edit Info for Free" />
      <meta
        property="og:description"
        content="Easily update PDF metadata online with PDFPivot. Edit title, author, keywords & more. Fast, secure, and 100% free—no sign-up or software needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/update-metadata" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Update PDF Metadata Online | Edit Info for Free" />
      <meta
        name="twitter:description"
        content="Easily update PDF metadata online with PDFPivot. Edit title, author, keywords & more. Fast, secure, and 100% free—no sign-up or software needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t('update_metadata_page.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('update_metadata_page.desc')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_pdf_file')}</label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 cursor-pointer ${
                      isDragActive ? 'border-gold bg-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest">
                          {t('upload_pdf_file')}
                        </span>
                        <p className="pl-1">{t('or_drag_and_drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t('pdf_up_to_20mb')}</p>
                      {file && (
                        <div className="mt-2">
                          <p className="text-sm text-indigo-600 font-medium">{t('update_metadata_page.selected_file')}:</p>
                          <p className="text-sm text-gray-500">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                    <input {...getInputProps()} className="sr-only" />
                  </div>
                </div>

                {/* Metadata Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('update_metadata_page.title_placeholder')}
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder={t('update_metadata_page.author_placeholder')}
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder={t('update_metadata_page.subject_placeholder')}
                    value={metadata.subject}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder={t('update_metadata_page.keywords_placeholder')}
                    value={metadata.keywords}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* Update Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleUpdate}
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
                        {t('update_metadata_page.updating')}
                      </>
                    ) : (
                      <>
                        <FaEdit className="mr-2" />
                        {t('update_metadata_page.update_metadata_btn')}
                      </>
                    )}
                  </button>
                </div>

                {/* Download Button */}
                {updatedFile && !loading && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <FaDownload className="w-5 h-5 mr-2" />
                      {t('update_metadata_page.download_updated_pdf')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default UpdateMetadataPage;