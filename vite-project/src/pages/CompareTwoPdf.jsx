import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

export default function PdfComparePage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [diffPdf, setDiffPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length !== 2) {
        setError(t('upload_exactly_two'));
        return;
      }
      setFiles(acceptedFiles);
      setError(null);
    },
  });

  const handleCompare = async () => {
    if (files.length !== 2) {
      setError(t('upload_exactly_two'));
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file1', files[0]);
    formData.append('file2', files[1]);
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('please_login'));
      setLoading(false);
      return;
    }
    try {
      const trackRes = await axios.post('/api/user/track', {
        service: 'compare-pdf',
        imageCount: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(import.meta.env.VITE_BACKEND_BASE_URL+'/api/compare-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }

      const blob = await response.blob();
      setDiffPdf(blob);
      toast.success(t('comparison_done'));
    } catch (err) {
      console.error("Comparison failed:", err);
      if (err.response?.status === 401) {
        setError(t('please_login'));
      } else if (err.response?.status === 403) {
        setError(t('pdf_limit_reached'));
      } else {
        setError(t('failed_compare_pdf'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (diffPdf) {
      const url = URL.createObjectURL(diffPdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diff.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (<>
   <Helmet>
      {/* SEO Meta Tags */}
      <title>Compare Two PDFs Online Free | Spot Changes Fast</title>
      <meta
        name="description"
        content="Quickly compare two PDFs with PDFPivot. Highlight text changes, differences, and edits in seconds. Free, secure, and easy—no sign-up or download needed."
      />

      {/* Open Graph (text-only) */}
      <meta property="og:title" content="Compare Two PDFs Online Free | Spot Changes Fast" />
      <meta
        property="og:description"
        content="Quickly compare two PDFs with PDFPivot. Highlight text changes, differences, and edits in seconds. Free, secure, and easy—no sign-up or download needed."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.pdfpivot.com/compare-pdf" />

      {/* Twitter Card (text-only summary) */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Compare Two PDFs Online Free | Spot Changes Fast" />
      <meta
        name="twitter:description"
        content="Quickly compare two PDFs with PDFPivot. Highlight text changes, differences, and edits in seconds. Free, secure, and easy—no sign-up or download needed."
      />
    </Helmet>

    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-indigo-700">{t('compare_two_pdfs')}</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <input {...getInputProps()} />
          <FaFilePdf className="mx-auto text-indigo-600 h-10 w-10 mb-2" />
          <p className="text-gray-600 text-sm">
            {t('drag_drop_two_pdfs')}
          </p>
          {files.length === 2 && (
            <ul className="mt-2 text-sm text-gray-700">
              {files.map(file => (
                <li key={file.name}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCompare}
            disabled={loading || files.length !== 2}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? t('comparing') : t('compare')}
          </button>
        </div>

        {diffPdf && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaDownload /> {t('download_diff_pdf')}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
