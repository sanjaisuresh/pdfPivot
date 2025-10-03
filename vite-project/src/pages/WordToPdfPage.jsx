import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileWord, FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';  // <-- import axios
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

const WordToPdfPage = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
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
      setError(t('word_to_pdf.please_select_word'));
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('document', file);
   const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
            const trackRes = await axios.post('/api/user/track', {
        service: 'word-to-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Sending request to server...');
      const response = await axios.post('/api/word-to-pdf', formData, {
        responseType: 'blob',  // Important to get file blob
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setConvertedFile(response.data);
      toast.success(t('word_to_pdf.success'));
    } catch (err) {
       console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('limit_reached'));
      } else {
        setError(t('word_to_pdf.failed'));
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
      link.download = 'converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Convert Word to PDF Online Free | Fast & Secure</title>
      <meta
        name="description"
        content="Convert Word to PDF with PDFPivot. Instantly turn DOC or DOCX files into high-quality PDFs. 100% free, secure, and easy—no sign-up or download needed."
      />

      {/* Open Graph (text-only) */}
      <meta property="og:title" content="Convert Word to PDF Online Free | Fast & Secure" />
      <meta
        property="og:description"
        content="Convert Word to PDF with PDFPivot. Instantly turn DOC or DOCX files into high-quality PDFs. 100% free, secure, and easy—no sign-up or download needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/word-to-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Convert Word to PDF Online Free | Fast & Secure" />
      <meta
        name="twitter:description"
        content="Convert Word to PDF with PDFPivot. Instantly turn DOC or DOCX files into high-quality PDFs. 100% free, secure, and easy—no sign-up or download needed."
      />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forest mb-2">{t('word_to_pdf.title')}</h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t('word_to_pdf.desc')}
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
                    {t('word_to_pdf.upload_label')}
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gold transition-colors duration-200 cursor-pointer ${
                      isDragActive ? 'border-gold bg-gold/10' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <FaFileWord className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-gold hover:text-forest focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold">
                          {t('word_to_pdf.upload_btn')}
                        </span>
                        <p className="pl-1">{t('or_drag_and_drop')}</p>
                      </div>
                      <p className="text-xs text-gray-500">{t('word_to_pdf.file_hint')}</p>
                      {file && (
                        <div className="mt-2">
                          <p className="text-sm text-indigo-600 font-medium">
                            {t('word_to_pdf.selected_file')}:
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                    <input {...getInputProps()} className="sr-only" />
                  </div>
                </div>

                {/* Convert Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleConvert}
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
                        {t('word_to_pdf.converting')}
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="mr-2" />
                        {t('word_to_pdf.convert_btn')}
                      </>
                    )}
                  </button>
                </div>

                {/* Download Button */}
                {convertedFile && !loading && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 hover:scale-105"
                    >
                      <FaDownload className="w-5 h-5 mr-2" />
                      {t('word_to_pdf.download_btn')}
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

export default WordToPdfPage;
